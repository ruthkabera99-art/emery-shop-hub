import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Read Stripe keys from store_settings using service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: settings } = await adminClient
      .from("store_settings")
      .select("key, value")
      .in("key", ["stripeSecretKey", "stripeEnabled"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });

    if (settingsMap.stripeEnabled !== "true") {
      return new Response(
        JSON.stringify({ error: "Stripe payments are not enabled. Please configure Stripe in admin settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSecretKey = settingsMap.stripeSecretKey;
    if (!stripeSecretKey || !stripeSecretKey.startsWith("sk_")) {
      return new Response(
        JSON.stringify({ error: "Stripe secret key is not configured. Please set it in admin settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe Checkout Session
    const lineItems = items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
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
        "metadata[coupon_code]": couponCode || "",
        "metadata[total]": String(total),
      }),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe error:", stripeData);
      return new Response(
        JSON.stringify({ error: stripeData.error?.message || "Failed to create checkout session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save order to database
    await adminClient.from("orders").insert({
      user_id: userId,
      total,
      items: items.map((i: any) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
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
