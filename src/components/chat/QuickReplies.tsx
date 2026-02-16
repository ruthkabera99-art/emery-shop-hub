import { motion } from "framer-motion";
import { ShoppingBag, CalendarCheck, DollarSign, Headphones } from "lucide-react";

const quickReplies = [
  { label: "Book Shoes", icon: ShoppingBag },
  { label: "Check Availability", icon: CalendarCheck },
  { label: "View Pricing", icon: DollarSign },
  { label: "Contact Support", icon: Headphones },
];

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

const QuickReplies = ({ onSelect }: QuickRepliesProps) => (
  <div className="flex flex-wrap gap-2 px-1">
    {quickReplies.map((qr, i) => (
      <motion.button
        key={qr.label}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 + i * 0.1 }}
        onClick={() => onSelect(qr.label)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
      >
        <qr.icon className="h-3 w-3" />
        {qr.label}
      </motion.button>
    ))}
  </div>
);

export default QuickReplies;
