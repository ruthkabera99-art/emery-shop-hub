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
      const { data, error } = await supabase.rpc("validate_coupon", {
        _code: code.toUpperCase().trim(),
        _order_total: orderTotal,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;

      if (!row) {
        setCoupon({ valid: false, code, discountType: "fixed", discountValue: 0, message: "Invalid coupon code" });
        return;
      }

      const discountType = (row.discount_type as "percentage" | "fixed") ?? "fixed";
      const discountValue = Number(row.discount_value ?? 0);
      const message = row.valid
        ? discountType === "percentage"
          ? `${discountValue}% off applied!`
          : `€${discountValue.toFixed(2)} off applied!`
        : row.message || "Invalid coupon code";

      setCoupon({
        valid: !!row.valid,
        code: row.code || code,
        discountType,
        discountValue,
        message,
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
