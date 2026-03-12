import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const ProductReviews = ({ productId }: { productId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        customer_name: name.trim(),
        rating,
        comment: comment.trim() || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Review submitted!", description: "Your review will appear after moderation." });
      setName("");
      setComment("");
      setRating(5);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    },
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold">Customer Reviews</h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? "fill-accent text-accent" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avgRating} out of 5 · {reviews.length} reviews</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-lg p-5 shadow-soft mb-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Your Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John D." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(s)}
                    >
                      <Star className={`h-6 w-6 transition-colors ${s <= (hoveredStar || rating) ? "fill-accent text-accent" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Comment</label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={3} />
              </div>
              <Button
                onClick={() => submitReview.mutate()}
                disabled={!name.trim() || submitReview.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                <Send className="h-4 w-4" />
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-lg p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg p-5 shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                    {review.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{review.customer_name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-accent text-accent" : "text-muted"}`} />
                ))}
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
