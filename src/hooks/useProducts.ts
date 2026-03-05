import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";

const mapDbProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  image: p.images?.[0] || "shoe-mens",
  category: p.category || "",
  badge: p.badge || (p.in_stock === false ? "Sold Out" : undefined),
  rating: Number(p.rating) || 0,
  reviews: p.reviews_count || 0,
  brand: p.brand || "",
});

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
  });
};
