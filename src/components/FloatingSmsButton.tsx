import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const SMS_NUMBER = "15551234567"; // Replace with actual admin phone number
const SMS_BODY = encodeURIComponent("Hi Emery Collection! I have a question about your shoes.");

const FloatingSmsButton = () => (
  <motion.a
    href={`sms:+${SMS_NUMBER}?body=${SMS_BODY}`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1, type: "spring", stiffness: 200 }}
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-full shadow-elevated hover:bg-accent/90 transition-colors group"
    aria-label="Send us a message"
  >
    <MessageCircle className="h-5 w-5" />
    <span className="text-sm font-semibold hidden sm:inline">Message Us</span>
  </motion.a>
);

export default FloatingSmsButton;
