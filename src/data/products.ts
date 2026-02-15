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
}

export const categories = [
  { name: "Men's", slug: "mens", image: "shoe-mens" },
  { name: "Women's", slug: "womens", image: "shoe-womens" },
  { name: "Kids", slug: "kids", image: "shoe-kids" },
  { name: "Sports", slug: "sports", image: "shoe-sports" },
  { name: "Sale", slug: "sale", image: "shoe-sale" },
];

export const products: Product[] = [
  { id: "1", name: "Jordan 1 Retro High OG", price: 189, image: "shoe-mens", category: "mens", badge: "Bestseller", rating: 4.8, reviews: 234 },
  { id: "2", name: "Air Force 1 Low Blush", price: 129, image: "shoe-womens", category: "womens", badge: "New", rating: 4.9, reviews: 128 },
  { id: "3", name: "Dunk Low Kids Aqua", price: 69, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 89 },
  { id: "4", name: "Air Max Volt Runner", price: 219, image: "shoe-sports", category: "sports", badge: "New", rating: 4.9, reviews: 312 },
  { id: "5", name: "Dunk Low Latte", price: 99, image: "shoe-casual", category: "mens", badge: "Bestseller", rating: 4.6, reviews: 456 },
  { id: "6", name: "Jordan 4 Retro Bred", price: 249, image: "shoe-boots", category: "mens", rating: 4.8, reviews: 167 },
  { id: "7", name: "Jordan 1 University Blue", price: 149, originalPrice: 189, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 203 },
  { id: "8", name: "Dunk Low Cream White", price: 109, image: "shoe-casual", category: "womens", rating: 4.7, reviews: 145 },
];

export const testimonials = [
  { name: "Tyler J.", text: "The Jordan 1s are absolute fire! Quality is insane and they came double-boxed. My go-to sneaker store now.", rating: 5, location: "New York, NY" },
  { name: "Marcus W.", text: "Copped the Jordan 4 Breds and they're even better in person. Fast shipping too, had them in 3 days.", rating: 5, location: "Chicago, IL" },
  { name: "Sophia L.", text: "Got the Air Force 1s for my collection. Perfect condition, authentic, and the price was right. 10/10!", rating: 5, location: "Los Angeles, CA" },
  { name: "Devon R.", text: "The Air Max Volts are insane for running and they look fire too. Best sports kicks I've owned.", rating: 5, location: "Austin, TX" },
];
