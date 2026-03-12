import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CouponResult {
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  message: string;
}

export const useCoupon = () => {
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [loading, setLoading] = useState(false);

  const applyCoupon = async (code: string, orderTotal: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setCoupon({ valid: false, code, discountType: "fixed", discountValue: 0, message: "Invalid coupon code" });
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCoupon({ valid: false, code, discountType: "fixed", discountValue: 0, message: "This coupon has expired" });
        return;
      }

      if (data.max_uses && data.used_count >= data.max_uses) {
        setCoupon({ valid: false, code, discountType: "fixed", discountValue: 0, message: "This coupon has reached its usage limit" });
        return;
      }

      if (data.min_order_amount && orderTotal < Number(data.min_order_amount)) {
        setCoupon({
          valid: false, code,
          discountType: data.discount_type as "percentage" | "fixed",
          discountValue: Number(data.discount_value),
          message: `Minimum order of €${Number(data.min_order_amount).toFixed(0)} required`,
        });
        return;
      }

      setCoupon({
        valid: true,
        code: data.code,
        discountType: data.discount_type as "percentage" | "fixed",
        discountValue: Number(data.discount_value),
        message: data.discount_type === "percentage"
          ? `${Number(data.discount_value)}% off applied!`
          : `€${Number(data.discount_value).toFixed(2)} off applied!`,
      });
    } catch {
      setCoupon({ valid: false, code, discountType: "fixed", discountValue: 0, message: "Error validating coupon" });
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => setCoupon(null);

  const calculateDiscount = (subtotal: number) => {
    if (!coupon?.valid) return 0;
    if (coupon.discountType === "percentage") return subtotal * (coupon.discountValue / 100);
    return Math.min(coupon.discountValue, subtotal);
  };

  return { coupon, loading, applyCoupon, removeCoupon, calculateDiscount };
};
