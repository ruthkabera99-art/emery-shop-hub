import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
        <div>
          <h3 className="font-display text-lg font-bold mb-4">EMERY <span className="text-gradient-warm">COLLECTION</span></h3>
          <p className="text-sm opacity-70 leading-relaxed">Premium footwear for every occasion. Crafted with care, designed for comfort.</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["Home", "Shop", "About Us", "Contact"].map((l) => (
              <Link key={l} to={l === "Home" ? "/" : `/${l.toLowerCase().replace(" ", "-")}`} className="text-sm opacity-70 hover:opacity-100 transition-opacity">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Categories</h4>
          <div className="flex flex-col gap-2">
            {["Men's", "Women's", "Kids", "Sports", "Sale"].map((c) => (
              <Link key={c} to="/shop" className="text-sm opacity-70 hover:opacity-100 transition-opacity">{c}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
          <div className="flex flex-col gap-3 text-sm opacity-70">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 123 Style Ave, New York, NY</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> (555) 123-4567</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@emerycollection.com</div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm opacity-50">
        © 2026 Emery Collection Shop. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
