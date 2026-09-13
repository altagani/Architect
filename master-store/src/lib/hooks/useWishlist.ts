"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useWishlist(productId: string) {
  const supabase = createClient();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle()
        .then(({ data }) => setIsWishlisted(!!data));
    });
  }, [productId]);

  async function toggle() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (isWishlisted) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
    }
    setIsWishlisted(!isWishlisted);
  }

  return { isWishlisted, toggle };
}
