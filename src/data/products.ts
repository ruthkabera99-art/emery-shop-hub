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
  { id: "1", name: "Classic Oxford Leather", price: 189, image: "shoe-mens", category: "mens", badge: "Bestseller", rating: 4.8, reviews: 234 },
  { id: "2", name: "Ivory Stiletto Pump", price: 159, image: "shoe-womens", category: "womens", badge: "New", rating: 4.9, reviews: 128 },
  { id: "3", name: "Rainbow Runner Kids", price: 69, image: "shoe-kids", category: "kids", rating: 4.7, reviews: 89 },
  { id: "4", name: "Velocity Pro Runner", price: 219, image: "shoe-sports", category: "sports", badge: "New", rating: 4.9, reviews: 312 },
  { id: "5", name: "Everyday Comfort Sneaker", price: 99, image: "shoe-casual", category: "mens", badge: "Bestseller", rating: 4.6, reviews: 456 },
  { id: "6", name: "Heritage Chelsea Boot", price: 249, image: "shoe-boots", category: "mens", rating: 4.8, reviews: 167 },
  { id: "7", name: "Sport Flex Red", price: 79, originalPrice: 129, image: "shoe-sale", category: "sale", badge: "Sale", rating: 4.5, reviews: 203 },
  { id: "8", name: "Urban Street White", price: 109, image: "shoe-casual", category: "womens", rating: 4.7, reviews: 145 },
];

export const testimonials = [
  { name: "Sarah M.", text: "Absolutely love my new heels! The quality is incredible and they're so comfortable for all-day wear.", rating: 5, location: "New York, NY" },
  { name: "James K.", text: "The Classic Oxford is the best dress shoe I've ever owned. Worth every penny.", rating: 5, location: "Chicago, IL" },
  { name: "Emily R.", text: "Fast shipping, gorgeous packaging, and the sneakers are even better in person. My new favorite store!", rating: 5, location: "Los Angeles, CA" },
  { name: "Michael T.", text: "Bought the Velocity Pro for marathon training. Outstanding support and comfort on long runs.", rating: 5, location: "Austin, TX" },
];
