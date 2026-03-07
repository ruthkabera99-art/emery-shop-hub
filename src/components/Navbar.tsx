import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { menu, loaded } = useSiteSettings();

  const navLinks = loaded
    ? menu.items.filter((i) => i.visible).map((i) => ({ name: i.label, to: i.url }))
    : [
        { name: "Home", to: "/" },
        { name: "Shop", to: "/shop" },
        { name: "Categories", to: "/shop" },
        { name: "About Us", to: "/about" },
        { name: "Contact", to: "/contact" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 px-4 lg:px-8">
        <Link to="/" className="font-display text-base sm:text-xl font-bold tracking-tight">
          EMERY <span className="text-gradient-warm">COLLECTION</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.name} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-secondary rounded-full transition-colors"><Search className="h-4 w-4" /></button>
          <Link to="/admin" className="p-2 hover:bg-secondary rounded-full transition-colors"><User className="h-4 w-4" /></Link>
          <Link to="/cart" className="relative p-2 hover:bg-secondary rounded-full transition-colors">
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-background"
          >
            <nav className="flex flex-col p-4 gap-3">
              {navLinks.map((l) => (
                <Link key={l.name} to={l.to} onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-muted-foreground hover:text-foreground">
                  {l.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
