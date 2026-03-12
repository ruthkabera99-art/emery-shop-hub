export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
  sizes?: number[];
  brand: string;
  inStock?: boolean;
  stockQuantity?: number;
  description?: string;
}

export const categories = [
  { name: "Men's", slug: "mens", image: "shoe-mens" },
  { name: "Women's", slug: "womens", image: "shoe-womens" },
  { name: "Kids", slug: "kids", image: "shoe-kids" },
  { name: "Sports", slug: "sports", image: "shoe-sports" },
  { name: "Sale", slug: "sale", image: "shoe-sale" },
];

const ms = [38, 39, 40, 41, 42, 43, 44, 45];
const ws = [36, 37, 38, 39, 40, 41, 42];
const ks = [28, 29, 30, 31, 32, 33, 34, 35];

export const products: Product[] = [
  // ── MEN'S (30) ──
  { id: "1", name: "Jordan 1 Retro High OG", price: 179, image: "shoe-mens", category: "mens", badge: "Bestseller", rating: 4.8, reviews: 234, sizes: ms, brand: "Jordan" },
  { id: "2", name: "Jordan 4 Retro Bred", price: 229, image: "shoe-boots", category: "mens", rating: 4.8, reviews: 167, sizes: ms, brand: "Jordan" },
  { id: "3", name: "Nike Dunk Low Latte", price: 109, image: "shoe-casual", category: "mens", badge: "Bestseller", rating: 4.6, reviews: 456, sizes: ms, brand: "Nike" },
  { id: "4", name: "Nike Air Max 90 Triple Black", price: 149, image: "shoe-mens", category: "mens", rating: 4.7, reviews: 312, sizes: ms, brand: "Nike" },
  { id: "5", name: "Jordan 1 Low Travis Scott", price: 289, image: "shoe-boots", category: "mens", badge: "Limited", rating: 4.9, reviews: 89, sizes: ms, brand: "Jordan" },
  { id: "6", name: "Nike Dunk High Panda", price: 129, image: "shoe-casual", category: "mens", rating: 4.5, reviews: 678, sizes: ms, brand: "Nike" },
  { id: "7", name: "Nike Air Force 1 '07 White", price: 119, image: "shoe-mens", category: "mens", badge: "Bestseller", rating: 4.9, reviews: 1024, sizes: ms, brand: "Nike" },
  { id: "8", name: "Jordan 3 White Cement", price: 219, image: "shoe-boots", category: "mens", rating: 4.8, reviews: 201, sizes: ms, brand: "Jordan" },
  { id: "9", name: "Nike Blazer Mid '77", price: 109, image: "shoe-casual", category: "mens", badge: "New", rating: 4.6, reviews: 145, sizes: ms, brand: "Nike" },
  { id: "10", name: "Jordan 11 Cool Grey", price: 249, image: "shoe-mens", category: "mens", rating: 4.9, reviews: 178, sizes: ms, brand: "Jordan" },
  { id: "11", name: "Adidas Superstar Classic", price: 99, image: "shoe-womens", category: "mens", rating: 4.6, reviews: 543, sizes: ms, brand: "Adidas" },
  { id: "12", name: "Puma Suede Classic Navy", price: 89, image: "shoe-casual", category: "mens", rating: 4.5, reviews: 321, sizes: ms, brand: "Puma" },
  { id: "13", name: "Adidas Forum Low White", price: 109, image: "shoe-womens", category: "mens", badge: "New", rating: 4.7, reviews: 189, sizes: ms, brand: "Adidas" },
  { id: "14", name: "Nike Air Max Plus TN", price: 179, image: "shoe-sports", category: "mens", rating: 4.8, reviews: 267, sizes: ms, brand: "Nike" },
  { id: "15", name: "Jordan 5 Retro Fire Red", price: 209, image: "shoe-boots", category: "mens", rating: 4.7, reviews: 156, sizes: ms, brand: "Jordan" },
  { id: "16", name: "Puma RS-X Reinvention", price: 119, image: "shoe-sports", category: "mens", badge: "New", rating: 4.5, reviews: 198, sizes: ms, brand: "Puma" },
  { id: "17", name: "Adidas NMD R1 Core Black", price: 139, image: "shoe-casual", category: "mens", rating: 4.6, reviews: 412, sizes: ms, brand: "Adidas" },
  { id: "18", name: "Nike Air Presto Off-White", price: 259, image: "shoe-mens", category: "mens", badge: "Limited", rating: 4.9, reviews: 78, sizes: ms, brand: "Nike" },
  { id: "19", name: "Jordan 6 Infrared", price: 199, image: "shoe-boots", category: "mens", rating: 4.8, reviews: 234, sizes: ms, brand: "Jordan" },
  { id: "20", name: "New Balance 550 White Green", price: 129, image: "shoe-casual", category: "mens", badge: "Bestseller", rating: 4.7, reviews: 567, sizes: ms, brand: "New Balance" },
  { id: "21", name: "Nike Air Max 1 Anniversary", price: 149, image: "shoe-mens", category: "mens", rating: 4.8, reviews: 189, sizes: ms, brand: "Nike" },
  { id: "22", name: "Adidas Gazelle Bold", price: 109, image: "shoe-womens", category: "mens", badge: "New", rating: 4.6, reviews: 345, sizes: ms, brand: "Adidas" },
  { id: "23", name: "Puma Clyde All-Pro", price: 129, image: "shoe-sports", category: "mens", rating: 4.5, reviews: 123, sizes: ms, brand: "Puma" },
  { id: "24", name: "Jordan 12 Playoff", price: 219, image: "shoe-boots", category: "mens", rating: 4.9, reviews: 145, sizes: ms, brand: "Jordan" },
  { id: "25", name: "Nike SB Dunk Low Pro", price: 119, image: "shoe-casual", category: "mens", badge: "Bestseller", rating: 4.7, reviews: 678, sizes: ms, brand: "Nike" },
  { id: "26", name: "Adidas Yeezy 500 Granite", price: 219, image: "shoe-sale", category: "mens", rating: 4.6, reviews: 89, sizes: ms, brand: "Adidas" },
  { id: "27", name: "New Balance 2002R Protection Pack", price: 159, image: "shoe-casual", category: "mens", badge: "New", rating: 4.8, reviews: 234, sizes: ms, brand: "New Balance" },
  { id: "28", name: "Puma Lamelo Ball MB.03", price: 149, image: "shoe-sports", category: "mens", rating: 4.7, reviews: 167, sizes: ms, brand: "Puma" },
  { id: "29", name: "Nike Air VaporMax Flyknit", price: 199, image: "shoe-sports", category: "mens", rating: 4.6, reviews: 289, sizes: ms, brand: "Nike" },
  { id: "30", name: "Jordan 1 Mid Banned", price: 139, image: "shoe-mens", category: "mens", badge: "Bestseller", rating: 4.8, reviews: 456, sizes: ms, brand: "Jordan" },

  // ── WOMEN'S (25) ──
  { id: "31", name: "Nike Air Force 1 Low Blush", price: 129, image: "shoe-womens", category: "womens", badge: "New", rating: 4.9, reviews: 128, sizes: ws, brand: "Nike" },
  { id: "32", name: "Nike Dunk Low Cream White", price: 109, image: "shoe-casual", category: "womens", rating: 4.7, reviews: 145, sizes: ws, brand: "Nike" },
  { id: "33", name: "Jordan 1 Mid SE Rose", price: 159, image: "shoe-womens", category: "womens", badge: "New", rating: 4.8, reviews: 98, sizes: ws, brand: "Jordan" },
  { id: "34", name: "Nike Air Max 97 Pink", price: 189, image: "shoe-womens", category: "womens", rating: 4.6, reviews: 234, sizes: ws, brand: "Nike" },
  { id: "35", name: "Nike Dunk Low Cacao Wow", price: 119, image: "shoe-casual", category: "womens", badge: "Bestseller", rating: 4.8, reviews: 567, sizes: ws, brand: "Nike" },
  { id: "36", name: "Jordan 1 Satin Bred", price: 179, image: "shoe-womens", category: "womens", rating: 4.7, reviews: 89, sizes: ws, brand: "Jordan" },
  { id: "37", name: "Nike Cortez Vintage", price: 99, image: "shoe-casual", category: "womens", badge: "New", rating: 4.5, reviews: 312, sizes: ws, brand: "Nike" },
  { id: "38", name: "Nike Air Max Plus Hyper Pink", price: 179, image: "shoe-womens", category: "womens", rating: 4.6, reviews: 156, sizes: ws, brand: "Nike" },
  { id: "39", name: "Jordan 4 Shimmer", price: 209, image: "shoe-womens", category: "womens", badge: "Limited", rating: 4.9, reviews: 67, sizes: ws, brand: "Jordan" },
  { id: "40", name: "Nike V2K Run Pearl", price: 129, image: "shoe-casual", category: "womens", rating: 4.7, reviews: 198, sizes: ws, brand: "Nike" },
  { id: "41", name: "Adidas Samba OG Cream", price: 109, image: "shoe-womens", category: "womens", badge: "Bestseller", rating: 4.9, reviews: 789, sizes: ws, brand: "Adidas" },
  { id: "42", name: "Puma Cali Dream Pastel", price: 99, image: "shoe-casual", category: "womens", badge: "New", rating: 4.6, reviews: 234, sizes: ws, brand: "Puma" },
  { id: "43", name: "Adidas Stan Smith Lux", price: 119, image: "shoe-womens", category: "womens", rating: 4.7, reviews: 456, sizes: ws, brand: "Adidas" },
  { id: "44", name: "New Balance 530 Ivory", price: 109, image: "shoe-casual", category: "womens", rating: 4.6, reviews: 345, sizes: ws, brand: "New Balance" },
  { id: "45", name: "Nike Air Huarache Blush", price: 129, image: "shoe-womens", category: "womens", rating: 4.5, reviews: 189, sizes: ws, brand: "Nike" },
  { id: "46", name: "Puma Mayze Stack White", price: 109, image: "shoe-casual", category: "womens", badge: "New", rating: 4.7, reviews: 267, sizes: ws, brand: "Puma" },
  { id: "47", name: "Adidas Gazelle Indoor Pink", price: 119, image: "shoe-womens", category: "womens", badge: "Bestseller", rating: 4.8, reviews: 534, sizes: ws, brand: "Adidas" },
  { id: "48", name: "Jordan 3 Lucky Green", price: 199, image: "shoe-boots", category: "womens", rating: 4.8, reviews: 112, sizes: ws, brand: "Jordan" },
  { id: "49", name: "Nike Dunk Low Lilac", price: 119, image: "shoe-casual", category: "womens", badge: "New", rating: 4.7, reviews: 278, sizes: ws, brand: "Nike" },
  { id: "50", name: "New Balance 9060 Sea Salt", price: 149, image: "shoe-casual", category: "womens", rating: 4.8, reviews: 189, sizes: ws, brand: "New Balance" },
  { id: "51", name: "Adidas Forum Mid Cloud White", price: 129, image: "shoe-womens", category: "womens", rating: 4.6, reviews: 156, sizes: ws, brand: "Adidas" },
  { id: "52", name: "Puma Speedcat OG Sparco", price: 109, image: "shoe-casual", category: "womens", badge: "New", rating: 4.5, reviews: 134, sizes: ws, brand: "Puma" },
  { id: "53", name: "Nike Air Max 90 Futura", price: 149, image: "shoe-womens", category: "womens", rating: 4.7, reviews: 234, sizes: ws, brand: "Nike" },
  { id: "54", name: "Jordan 1 Low Coconut Milk", price: 119, image: "shoe-casual", category: "womens", badge: "Bestseller", rating: 4.8, reviews: 456, sizes: ws, brand: "Jordan" },
  { id: "55", name: "Adidas Samba Vegan Rose", price: 99, image: "shoe-womens", category: "womens", rating: 4.6, reviews: 312, sizes: ws, brand: "Adidas" },

  // ── KIDS (20) ──
  { id: "56", name: "Nike Dunk Low Kids Aqua", price: 69, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 89, sizes: ks, brand: "Nike" },
  { id: "57", name: "Jordan 1 Mid Kids Bred", price: 79, image: "shoe-kids", category: "kids", badge: "New", rating: 4.8, reviews: 123, sizes: ks, brand: "Jordan" },
  { id: "58", name: "Nike Air Max 90 Kids White", price: 75, image: "shoe-kids", category: "kids", rating: 4.6, reviews: 67, sizes: ks, brand: "Nike" },
  { id: "59", name: "Nike Star Runner 3 Kids", price: 55, image: "shoe-kids", category: "kids", badge: "Bestseller", rating: 4.9, reviews: 345, sizes: ks, brand: "Nike" },
  { id: "60", name: "Nike Dunk Low PS Panda", price: 65, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 234, sizes: ks, brand: "Nike" },
  { id: "61", name: "Jordan 4 Kids Fire Red", price: 89, image: "shoe-kids", category: "kids", rating: 4.8, reviews: 112, sizes: ks, brand: "Jordan" },
  { id: "62", name: "Nike AF1 Kids Triple White", price: 59, image: "shoe-kids", category: "kids", badge: "New", rating: 4.7, reviews: 189, sizes: ks, brand: "Nike" },
  { id: "63", name: "Nike Revolution 6 Kids", price: 45, image: "shoe-kids", category: "kids", rating: 4.5, reviews: 278, sizes: ks, brand: "Nike" },
  { id: "64", name: "Jordan 1 Low Kids UNC", price: 69, image: "shoe-kids", category: "kids", rating: 4.6, reviews: 156, sizes: ks, brand: "Jordan" },
  { id: "65", name: "Nike Air Max 270 Kids React", price: 85, image: "shoe-kids", category: "kids", badge: "Bestseller", rating: 4.8, reviews: 201, sizes: ks, brand: "Nike" },
  { id: "66", name: "Adidas Superstar Kids", price: 59, image: "shoe-kids", category: "kids", rating: 4.6, reviews: 267, sizes: ks, brand: "Adidas" },
  { id: "67", name: "Puma Future Rider Kids", price: 49, image: "shoe-kids", category: "kids", badge: "New", rating: 4.5, reviews: 145, sizes: ks, brand: "Puma" },
  { id: "68", name: "Adidas Stan Smith Kids", price: 55, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 312, sizes: ks, brand: "Adidas" },
  { id: "69", name: "Nike Flex Runner Kids", price: 49, image: "shoe-kids", category: "kids", rating: 4.6, reviews: 234, sizes: ks, brand: "Nike" },
  { id: "70", name: "Jordan 1 Mid Kids Lakers", price: 79, image: "shoe-kids", category: "kids", badge: "New", rating: 4.8, reviews: 167, sizes: ks, brand: "Jordan" },
  { id: "71", name: "Puma Caven Kids White", price: 39, image: "shoe-kids", category: "kids", rating: 4.5, reviews: 189, sizes: ks, brand: "Puma" },
  { id: "72", name: "Adidas Forum Low Kids", price: 65, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 145, sizes: ks, brand: "Adidas" },
  { id: "73", name: "Nike Court Borough Kids", price: 55, image: "shoe-kids", category: "kids", badge: "Bestseller", rating: 4.6, reviews: 389, sizes: ks, brand: "Nike" },
  { id: "74", name: "New Balance 574 Kids Grey", price: 59, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 178, sizes: ks, brand: "New Balance" },
  { id: "75", name: "Jordan Flare Kids Red", price: 49, image: "shoe-kids", category: "kids", badge: "New", rating: 4.5, reviews: 134, sizes: ks, brand: "Jordan" },

  // ── SPORTS (25) ──
  { id: "76", name: "Nike Air Max Volt Runner", price: 219, image: "shoe-sports", category: "sports", badge: "New", rating: 4.9, reviews: 312, sizes: ms, brand: "Nike" },
  { id: "77", name: "Nike ZoomX Vaporfly", price: 269, image: "shoe-sports", category: "sports", badge: "Pro", rating: 4.9, reviews: 456, sizes: ms, brand: "Nike" },
  { id: "78", name: "Nike React Infinity Run 4", price: 169, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 234, sizes: ms, brand: "Nike" },
  { id: "79", name: "Nike Pegasus 41 Electric", price: 139, image: "shoe-sports", category: "sports", badge: "Bestseller", rating: 4.8, reviews: 567, sizes: ms, brand: "Nike" },
  { id: "80", name: "Nike Metcon 9 Gym", price: 149, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 189, sizes: ms, brand: "Nike" },
  { id: "81", name: "Nike Air Zoom Structure 25", price: 139, image: "shoe-sports", category: "sports", rating: 4.6, reviews: 145, sizes: ms, brand: "Nike" },
  { id: "82", name: "Nike Invincible 3", price: 189, image: "shoe-sports", category: "sports", badge: "New", rating: 4.8, reviews: 278, sizes: ms, brand: "Nike" },
  { id: "83", name: "Nike Free Run 5.0 Flex", price: 109, image: "shoe-sports", category: "sports", rating: 4.5, reviews: 345, sizes: ms, brand: "Nike" },
  { id: "84", name: "Nike Air Zoom Tempo NEXT%", price: 199, image: "shoe-sports", category: "sports", badge: "Pro", rating: 4.9, reviews: 167, sizes: ms, brand: "Nike" },
  { id: "85", name: "Nike Wildhorse 8 Trail", price: 149, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 123, sizes: ms, brand: "Nike" },
  { id: "86", name: "Adidas Ultraboost Light", price: 189, image: "shoe-sports", category: "sports", badge: "Bestseller", rating: 4.9, reviews: 678, sizes: ms, brand: "Adidas" },
  { id: "87", name: "Adidas Adizero Adios Pro 3", price: 249, image: "shoe-sports", category: "sports", badge: "Pro", rating: 4.9, reviews: 145, sizes: ms, brand: "Adidas" },
  { id: "88", name: "Puma Velocity Nitro 3", price: 139, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 234, sizes: ms, brand: "Puma" },
  { id: "89", name: "Puma Deviate Nitro Elite", price: 199, image: "shoe-sports", category: "sports", badge: "Pro", rating: 4.8, reviews: 112, sizes: ms, brand: "Puma" },
  { id: "90", name: "Adidas Solar Boost 5", price: 159, image: "shoe-sports", category: "sports", rating: 4.6, reviews: 267, sizes: ms, brand: "Adidas" },
  { id: "91", name: "New Balance FuelCell SC Elite", price: 229, image: "shoe-sports", category: "sports", badge: "Pro", rating: 4.9, reviews: 89, sizes: ms, brand: "New Balance" },
  { id: "92", name: "Nike Jordan Luka 2", price: 139, image: "shoe-sports", category: "sports", badge: "New", rating: 4.7, reviews: 189, sizes: ms, brand: "Jordan" },
  { id: "93", name: "Adidas Dame 9 Basketball", price: 129, image: "shoe-sports", category: "sports", rating: 4.6, reviews: 156, sizes: ms, brand: "Adidas" },
  { id: "94", name: "Puma MB.03 Toxic", price: 159, image: "shoe-sports", category: "sports", badge: "New", rating: 4.8, reviews: 234, sizes: ms, brand: "Puma" },
  { id: "95", name: "Nike KD 16 Aunt Pearl", price: 179, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 145, sizes: ms, brand: "Nike" },
  { id: "96", name: "Adidas Harden Vol 8", price: 149, image: "shoe-sports", category: "sports", rating: 4.6, reviews: 178, sizes: ms, brand: "Adidas" },
  { id: "97", name: "New Balance Fresh Foam X", price: 139, image: "shoe-sports", category: "sports", badge: "Bestseller", rating: 4.7, reviews: 345, sizes: ms, brand: "New Balance" },
  { id: "98", name: "Nike LeBron 21", price: 199, image: "shoe-sports", category: "sports", badge: "New", rating: 4.8, reviews: 267, sizes: ms, brand: "Nike" },
  { id: "99", name: "Puma Court Rider 3", price: 119, image: "shoe-sports", category: "sports", rating: 4.5, reviews: 134, sizes: ms, brand: "Puma" },
  { id: "100", name: "Jordan Tatum 2 Vortex", price: 129, image: "shoe-sports", category: "sports", badge: "New", rating: 4.7, reviews: 189, sizes: ms, brand: "Jordan" },

  // ── SALE (20) ──
  { id: "101", name: "Jordan 1 University Blue", price: 139, originalPrice: 179, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 203, sizes: ms, brand: "Jordan" },
  { id: "102", name: "Nike Dunk Low Grey Fog", price: 79, originalPrice: 119, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 345, sizes: ms, brand: "Nike" },
  { id: "103", name: "Nike Air Max 95 Essential", price: 119, originalPrice: 179, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.7, reviews: 189, sizes: ms, brand: "Nike" },
  { id: "104", name: "Jordan 1 Low Mocha", price: 99, originalPrice: 149, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.8, reviews: 567, sizes: ms, brand: "Jordan" },
  { id: "105", name: "Nike Waffle One Sail", price: 69, originalPrice: 109, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.4, reviews: 234, sizes: ms, brand: "Nike" },
  { id: "106", name: "Nike Dunk Low Olive", price: 89, originalPrice: 129, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 178, sizes: ms, brand: "Nike" },
  { id: "107", name: "Nike Air Max 1 Obsidian", price: 109, originalPrice: 159, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.7, reviews: 145, sizes: ms, brand: "Nike" },
  { id: "108", name: "Jordan 5 Racer Blue", price: 149, originalPrice: 219, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.8, reviews: 112, sizes: ms, brand: "Jordan" },
  { id: "109", name: "Nike Presto React", price: 79, originalPrice: 139, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 289, sizes: ms, brand: "Nike" },
  { id: "110", name: "Nike Dunk High Burgundy", price: 89, originalPrice: 139, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 167, sizes: ms, brand: "Nike" },
  { id: "111", name: "Adidas NMD R1 Olive", price: 89, originalPrice: 139, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 234, sizes: ms, brand: "Adidas" },
  { id: "112", name: "Puma Suede Classic Burgundy", price: 59, originalPrice: 89, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.4, reviews: 178, sizes: ms, brand: "Puma" },
  { id: "113", name: "Nike Air Max 270 React", price: 109, originalPrice: 169, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.7, reviews: 234, sizes: ms, brand: "Nike" },
  { id: "114", name: "Jordan 1 Mid Smoke Grey", price: 99, originalPrice: 139, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 345, sizes: ms, brand: "Jordan" },
  { id: "115", name: "Adidas Gazelle Grey", price: 69, originalPrice: 109, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 289, sizes: ws, brand: "Adidas" },
  { id: "116", name: "Nike Dunk Low Team Green", price: 79, originalPrice: 119, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 156, sizes: ms, brand: "Nike" },
  { id: "117", name: "New Balance 574 Legacy", price: 69, originalPrice: 109, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 234, sizes: ms, brand: "New Balance" },
  { id: "118", name: "Puma RS-X3 Puzzle", price: 79, originalPrice: 119, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.4, reviews: 167, sizes: ms, brand: "Puma" },
  { id: "119", name: "Nike Huarache Run Ultra", price: 89, originalPrice: 139, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 198, sizes: ms, brand: "Nike" },
  { id: "120", name: "Jordan 1 Low Pine Green", price: 89, originalPrice: 129, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.7, reviews: 145, sizes: ms, brand: "Jordan" },
];

export const brands = [...new Set(products.map((p) => p.brand))].sort();

export const testimonials = [
  { name: "Sarah M.", text: "Best sneakers I've ever bought! The quality is incredible and they fit perfectly.", rating: 5, location: "New York, US" },
  { name: "James L.", text: "Fast shipping and the shoes look even better in person. Will definitely buy again!", rating: 5, location: "London, UK" },
  { name: "Emma R.", text: "Love the variety of brands available. Found exactly what I was looking for.", rating: 4, location: "Paris, FR" },
  { name: "David K.", text: "Great customer service and the return process was seamless. Highly recommend!", rating: 5, location: "Berlin, DE" },
  { name: "Lisa T.", text: "My kids love their new shoes! Great prices for premium brands.", rating: 5, location: "Toronto, CA" },
  { name: "Marco P.", text: "Authentic products, great packaging. This is my go-to shoe store now.", rating: 5, location: "Milan, IT" },
  { name: "Anna S.", text: "The sale section has amazing deals. Got two pairs for the price of one!", rating: 4, location: "Stockholm, SE" },
  { name: "Chris W.", text: "Incredibly comfortable running shoes. Perfect for my daily training.", rating: 5, location: "Sydney, AU" },
];
