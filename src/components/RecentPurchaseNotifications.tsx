import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, MapPin, Check } from "lucide-react";

const NAMES = [
  "Sophia", "Liam", "Emma", "Noah", "Olivia", "Lucas", "Mia", "Ethan",
  "Ava", "Mason", "Isabella", "Logan", "Amelia", "Jackson", "Chloé",
  "Léa", "Hugo", "Camille", "Mateo", "Giulia",
];
const CITIES = [
  "Paris", "Berlin", "Madrid", "Milan", "Amsterdam", "Lisbon", "Vienna",
  "Brussels", "Dublin", "Copenhagen", "Barcelona", "Rome", "Munich",
  "Zurich", "Stockholm",
];
const PRODUCTS = [
  "Air Runner Pro", "Cloud Glide 2", "Urban Court Low", "Velocity Knit",
  "Heritage 87", "Edge Boost", "Street Flex", "Retro Wave", "Mono Trainer",
  "Skyline Hi", "Pulse Mesh", "Drift Classic",
];
const TIMES = ["just now", "1 min ago", "2 mins ago", "4 mins ago", "6 mins ago", "8 mins ago"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

interface Notice {
  id: number;
  name: string;
  city: string;
  product: string;
  time: string;
}

const RecentPurchaseNotifications = () => {
  const [current, setCurrent] = useState<Notice | null>(null);

  useEffect(() => {
    let id = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const cycle = () => {
      id += 1;
      setCurrent({
        id,
        name: pick(NAMES),
        city: pick(CITIES),
        product: pick(PRODUCTS),
        time: pick(TIMES),
      });
      timeout = setTimeout(() => {
        setCurrent(null);
        timeout = setTimeout(cycle, 4500 + Math.random() * 3500);
      }, 5000);
    };

    timeout = setTimeout(cycle, 8000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed bottom-24 left-4 z-40 pointer-events-none max-w-[18rem] sm:max-w-xs">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pointer-events-auto bg-card/95 backdrop-blur border border-border rounded-xl shadow-elegant p-3 flex items-start gap-3"
          >
            <div className="relative shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-tight">
                <span className="font-semibold">{current.name}</span>{" "}
                <span className="text-muted-foreground">just bought</span>
              </p>
              <p className="text-xs font-semibold truncate text-foreground/90">
                {current.product}
              </p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {current.city} • {current.time}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentPurchaseNotifications;
