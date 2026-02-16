import { motion } from "framer-motion";

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-card text-card-foreground rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default TypingIndicator;
