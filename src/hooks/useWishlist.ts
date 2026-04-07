import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistIds = [] } = useQuery({
    queryKey: ["wishlist-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((w) => w.product_id);
    },
  });

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      const isInWishlist = wishlistIds.includes(productId);
      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (added) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast({ title: added ? "Added to wishlist ❤️" : "Removed from wishlist" });
    },
  });

  return {
    wishlistIds,
    isInWishlist: (id: string) => wishlistIds.includes(id),
    toggleWishlist: (id: string) => {
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to save items to your wishlist.", variant: "destructive" });
        return;
      }
      toggle.mutate(id);
    },
  };
};
