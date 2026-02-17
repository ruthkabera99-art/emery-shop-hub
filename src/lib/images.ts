import shoeMens from "@/assets/shoe-mens.jpg";
import shoeWomens from "@/assets/shoe-womens.jpg";
import shoeKids from "@/assets/shoe-kids.jpg";
import shoeSports from "@/assets/shoe-sports.jpg";
import shoeCasual from "@/assets/shoe-casual.jpg";
import shoeBoots from "@/assets/shoe-boots.jpg";
import shoeSale from "@/assets/shoe-sale.jpg";
import heroBanner from "@/assets/hero-banner.jpg";

export const imageMap: Record<string, string> = {
  "shoe-mens": shoeMens,
  "shoe-womens": shoeWomens,
  "shoe-kids": shoeKids,
  "shoe-sports": shoeSports,
  "shoe-casual": shoeCasual,
  "shoe-boots": shoeBoots,
  "shoe-sale": shoeSale,
  "hero-banner": heroBanner,
};

export const getImage = (key: string) => {
  // If it's a full URL (from Supabase storage), return as-is
  if (key.startsWith("http")) return key;
  return imageMap[key] || "";
};
