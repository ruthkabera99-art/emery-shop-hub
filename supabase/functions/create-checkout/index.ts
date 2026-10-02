import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Parse and validate body
    const body = await req.json();
    const { items, total, couponCode, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Items are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof total !== "number" || total <= 0) {
      return new Response(JSON.stringify({ error: "Invalid total" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Stripe secret key: prefer the Edge Function secret, fall back to the
    // admin-managed key stored in the service-role-only admin_secrets table.
    let stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    if (!stripeSecretKey.startsWith("sk_")) {
      const { data: secretRow } = await adminClient
        .from("admin_secrets")
        .select("value")
        .eq("key", "STRIPE_SECRET_KEY")
        .maybeSingle();
      stripeSecretKey = secretRow?.value ?? "";
    }
    if (!stripeSecretKey.startsWith("sk_")) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured. Add your Stripe secret key in Admin → Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side price verification against the products table
    const productIds = items.map((i: { id?: string }) => i.id).filter(Boolean);
    if (productIds.length !== items.length) {
      return new Response(JSON.stringify({ error: "Each item requires a product id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: products, error: productsError } = await adminClient
      .from("products")
      .select("id, name, price, images")
      .in("id", productIds);

    if (productsError || !products) {
      return new Response(JSON.stringify({ error: "Unable to verify products" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productMap = new Map(products.map((p: { id: string; name: string; price: number; images: string[] | null }) => [p.id, p]));

    const verifiedItems: { id: string; name: string; price: number; quantity: number; image?: string }[] = [];
    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return new Response(JSON.stringify({ error: "One or more products are unavailable" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return new Response(JSON.stringify({ error: "Invalid quantity" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      verifiedItems.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity,
        image: typeof item.image === "string" && item.image.startsWith("http") ? item.image : product.images?.[0],
      });
    }

    // Server-computed totals (client "total" is ignored for charging)
    const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const verifiedTotal = Math.round((subtotal + (subtotal >= 100 ? 0 : 9.99)) * 100) / 100;

    const lineItems = verifiedItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));


    const origin = req.headers.get("origin") || "https://emery-shop-hub.lovable.app";

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "success_url": `${origin}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `${origin}/checkout`,
        "customer_email": claimsData.claims.email as string || "",
        ...lineItems.reduce((acc: Record<string, string>, item: any, i: number) => {
          acc[`line_items[${i}][price_data][currency]`] = item.price_data.currency;
          acc[`line_items[${i}][price_data][product_data][name]`] = item.price_data.product_data.name;
          acc[`line_items[${i}][price_data][unit_amount]`] = String(item.price_data.unit_amount);
          acc[`line_items[${i}][quantity]`] = String(item.quantity);
          if (item.price_data.product_data.images?.[0]) {
            acc[`line_items[${i}][price_data][product_data][images][0]`] = item.price_data.product_data.images[0];
          }
          return acc;
        }, {}),
        "metadata[user_id]": userId,
        "metadata[coupon_code]": typeof couponCode === "string" ? couponCode.slice(0, 64) : "",
        "metadata[total]": String(verifiedTotal),
      }),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe error:", stripeData);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save order to database using server-verified values
    await adminClient.from("orders").insert({
      user_id: userId,
      total: verifiedTotal,
      items: verifiedItems,
      shipping_address: shippingAddress || null,
      status: "pending",
    });


    return new Response(
      JSON.stringify({ url: stripeData.url, sessionId: stripeData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
