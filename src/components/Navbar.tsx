import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, Heart, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
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
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40 transition-all">
      <div className="container mx-auto flex items-center justify-between h-16 sm:h-[72px] px-4 lg:px-8">
        <Link to="/" className="font-display text-lg sm:text-xl font-bold tracking-tight select-none">
          EMERY <span className="text-gradient-warm">COLLECTION</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.name}
              to={l.to}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-secondary/60"
            >
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button className="p-2.5 hover:bg-secondary/60 rounded-full transition-colors" aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </button>
          {user && (
            <Link to="/account" className="p-2.5 hover:bg-secondary/60 rounded-full transition-colors" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" />
            </Link>
          )}
          <Link to={user ? "/account" : "/auth"} className="p-2.5 hover:bg-secondary/60 rounded-full transition-colors" aria-label="Account">
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link to="/cart" className="relative p-2.5 hover:bg-secondary/60 rounded-full transition-colors" aria-label="Cart">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center shadow-sm"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
          <button className="md:hidden p-2.5 ml-1" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col p-5 gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.name}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  {l.name}
                </Link>
              ))}
              <div className="h-px bg-border/60 my-2" />
              {user ? (
                <>
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60">
                    My Account
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="text-sm font-medium py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 text-left flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold py-3 px-4 rounded-xl bg-accent text-accent-foreground text-center"
                >
                  Sign In / Sign Up
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
