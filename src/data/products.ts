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
}

export const categories = [
  { name: "Men's", slug: "mens", image: "shoe-mens" },
  { name: "Women's", slug: "womens", image: "shoe-womens" },
  { name: "Kids", slug: "kids", image: "shoe-kids" },
  { name: "Sports", slug: "sports", image: "shoe-sports" },
  { name: "Sale", slug: "sale", image: "shoe-sale" },
];

const defaultSizes = [38, 39, 40, 41, 42, 43, 44, 45];
const kidsSizes = [28, 29, 30, 31, 32, 33, 34, 35];

export const products: Product[] = [
  // Men's Collection
  { id: "1", name: "Jordan 1 Retro High OG", price: 179, image: "shoe-mens", category: "mens", badge: "Bestseller", rating: 4.8, reviews: 234, sizes: defaultSizes },
  { id: "2", name: "Jordan 4 Retro Bred", price: 229, image: "shoe-boots", category: "mens", rating: 4.8, reviews: 167, sizes: defaultSizes },
  { id: "3", name: "Dunk Low Latte", price: 109, image: "shoe-casual", category: "mens", badge: "Bestseller", rating: 4.6, reviews: 456, sizes: defaultSizes },
  { id: "4", name: "Air Max 90 Triple Black", price: 149, image: "shoe-mens", category: "mens", rating: 4.7, reviews: 312, sizes: defaultSizes },
  { id: "5", name: "Jordan 1 Low Travis Scott", price: 289, image: "shoe-boots", category: "mens", badge: "Limited", rating: 4.9, reviews: 89, sizes: defaultSizes },
  { id: "6", name: "Nike Dunk High Panda", price: 129, image: "shoe-casual", category: "mens", rating: 4.5, reviews: 678, sizes: defaultSizes },
  { id: "7", name: "Air Force 1 '07 White", price: 119, image: "shoe-mens", category: "mens", badge: "Bestseller", rating: 4.9, reviews: 1024, sizes: defaultSizes },
  { id: "8", name: "Jordan 3 White Cement", price: 219, image: "shoe-boots", category: "mens", rating: 4.8, reviews: 201, sizes: defaultSizes },
  { id: "9", name: "Nike Blazer Mid '77", price: 109, image: "shoe-casual", category: "mens", badge: "New", rating: 4.6, reviews: 145, sizes: defaultSizes },
  { id: "10", name: "Jordan 11 Cool Grey", price: 249, image: "shoe-mens", category: "mens", rating: 4.9, reviews: 178, sizes: defaultSizes },

  // Women's Collection
  { id: "11", name: "Air Force 1 Low Blush", price: 129, image: "shoe-womens", category: "womens", badge: "New", rating: 4.9, reviews: 128, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "12", name: "Dunk Low Cream White", price: 109, image: "shoe-casual", category: "womens", rating: 4.7, reviews: 145, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "13", name: "Jordan 1 Mid SE Rose", price: 159, image: "shoe-womens", category: "womens", badge: "New", rating: 4.8, reviews: 98, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "14", name: "Nike Air Max 97 Pink", price: 189, image: "shoe-womens", category: "womens", rating: 4.6, reviews: 234, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "15", name: "Dunk Low Cacao Wow", price: 119, image: "shoe-casual", category: "womens", badge: "Bestseller", rating: 4.8, reviews: 567, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "16", name: "Air Jordan 1 Satin Bred", price: 179, image: "shoe-womens", category: "womens", rating: 4.7, reviews: 89, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "17", name: "Nike Cortez Vintage", price: 99, image: "shoe-casual", category: "womens", badge: "New", rating: 4.5, reviews: 312, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "18", name: "Air Max Plus Hyper Pink", price: 179, image: "shoe-womens", category: "womens", rating: 4.6, reviews: 156, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "19", name: "Jordan 4 Shimmer", price: 209, image: "shoe-womens", category: "womens", badge: "Limited", rating: 4.9, reviews: 67, sizes: [36, 37, 38, 39, 40, 41, 42] },
  { id: "20", name: "Nike V2K Run Pearl", price: 129, image: "shoe-casual", category: "womens", rating: 4.7, reviews: 198, sizes: [36, 37, 38, 39, 40, 41, 42] },

  // Kids Collection
  { id: "21", name: "Dunk Low Kids Aqua", price: 69, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 89, sizes: kidsSizes },
  { id: "22", name: "Jordan 1 Mid Kids Bred", price: 79, image: "shoe-kids", category: "kids", badge: "New", rating: 4.8, reviews: 123, sizes: kidsSizes },
  { id: "23", name: "Air Max 90 Kids White", price: 75, image: "shoe-kids", category: "kids", rating: 4.6, reviews: 67, sizes: kidsSizes },
  { id: "24", name: "Nike Star Runner 3", price: 55, image: "shoe-kids", category: "kids", badge: "Bestseller", rating: 4.9, reviews: 345, sizes: kidsSizes },
  { id: "25", name: "Dunk Low PS Panda", price: 65, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 234, sizes: kidsSizes },
  { id: "26", name: "Jordan 4 Kids Fire Red", price: 89, image: "shoe-kids", category: "kids", rating: 4.8, reviews: 112, sizes: kidsSizes },
  { id: "27", name: "Air Force 1 Kids Triple White", price: 59, image: "shoe-kids", category: "kids", badge: "New", rating: 4.7, reviews: 189, sizes: kidsSizes },
  { id: "28", name: "Nike Revolution 6 Kids", price: 45, image: "shoe-kids", category: "kids", rating: 4.5, reviews: 278, sizes: kidsSizes },
  { id: "29", name: "Jordan 1 Low Kids UNC", price: 69, image: "shoe-kids", category: "kids", rating: 4.6, reviews: 156, sizes: kidsSizes },
  { id: "30", name: "Air Max 270 Kids React", price: 85, image: "shoe-kids", category: "kids", badge: "Bestseller", rating: 4.8, reviews: 201, sizes: kidsSizes },

  // Sports Collection
  { id: "31", name: "Air Max Volt Runner", price: 219, image: "shoe-sports", category: "sports", badge: "New", rating: 4.9, reviews: 312, sizes: defaultSizes },
  { id: "32", name: "Nike ZoomX Vaporfly", price: 269, image: "shoe-sports", category: "sports", badge: "Pro", rating: 4.9, reviews: 456, sizes: defaultSizes },
  { id: "33", name: "React Infinity Run 4", price: 169, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 234, sizes: defaultSizes },
  { id: "34", name: "Pegasus 41 Electric", price: 139, image: "shoe-sports", category: "sports", badge: "Bestseller", rating: 4.8, reviews: 567, sizes: defaultSizes },
  { id: "35", name: "Nike Metcon 9 Gym", price: 149, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 189, sizes: defaultSizes },
  { id: "36", name: "Air Zoom Structure 25", price: 139, image: "shoe-sports", category: "sports", rating: 4.6, reviews: 145, sizes: defaultSizes },
  { id: "37", name: "Nike Invincible 3", price: 189, image: "shoe-sports", category: "sports", badge: "New", rating: 4.8, reviews: 278, sizes: defaultSizes },
  { id: "38", name: "Free Run 5.0 Flex", price: 109, image: "shoe-sports", category: "sports", rating: 4.5, reviews: 345, sizes: defaultSizes },
  { id: "39", name: "Air Zoom Tempo NEXT%", price: 199, image: "shoe-sports", category: "sports", badge: "Pro", rating: 4.9, reviews: 167, sizes: defaultSizes },
  { id: "40", name: "Nike Wildhorse 8 Trail", price: 149, image: "shoe-sports", category: "sports", rating: 4.7, reviews: 123, sizes: defaultSizes },

  // Sale Collection
  { id: "41", name: "Jordan 1 University Blue", price: 139, originalPrice: 179, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 203, sizes: defaultSizes },
  { id: "42", name: "Dunk Low Grey Fog", price: 79, originalPrice: 119, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 345, sizes: defaultSizes },
  { id: "43", name: "Air Max 95 Essential", price: 119, originalPrice: 179, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.7, reviews: 189, sizes: defaultSizes },
  { id: "44", name: "Jordan 1 Low Mocha", price: 99, originalPrice: 149, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.8, reviews: 567, sizes: defaultSizes },
  { id: "45", name: "Nike Waffle One Sail", price: 69, originalPrice: 109, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.4, reviews: 234, sizes: defaultSizes },
  { id: "46", name: "Dunk Low Olive", price: 89, originalPrice: 129, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 178, sizes: defaultSizes },
  { id: "47", name: "Air Max 1 Obsidian", price: 109, originalPrice: 159, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.7, reviews: 145, sizes: defaultSizes },
  { id: "48", name: "Jordan 5 Racer Blue", price: 149, originalPrice: 219, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.8, reviews: 112, sizes: defaultSizes },
  { id: "49", name: "Nike Presto React", price: 79, originalPrice: 139, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 289, sizes: defaultSizes },
  { id: "50", name: "Dunk High Burgundy", price: 89, originalPrice: 139, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.6, reviews: 167, sizes: defaultSizes },
];

export const testimonials = [
  { name: "Tyler J.", text: "The Jordan 1s are absolute fire! Quality is insane and they came double-boxed. My go-to sneaker store now.", rating: 5, location: "Paris, FR" },
  { name: "Marcus W.", text: "Copped the Jordan 4 Breds and they're even better in person. Fast shipping too, had them in 3 days.", rating: 5, location: "Berlin, DE" },
  { name: "Sophia L.", text: "Got the Air Force 1s for my collection. Perfect condition, authentic, and the price was right. 10/10!", rating: 5, location: "Amsterdam, NL" },
  { name: "Devon R.", text: "The Air Max Volts are insane for running and they look fire too. Best sports kicks I've owned.", rating: 5, location: "Milan, IT" },
];
