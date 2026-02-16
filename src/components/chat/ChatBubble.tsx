import { motion } from "framer-motion";

interface ChatBubbleProps {
  content: string;
  senderType: string;
  timestamp: string;
}

const ChatBubble = ({ content, senderType, timestamp }: ChatBubbleProps) => {
  const isVisitor = senderType === "visitor";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[80%] px-3 py-2 text-sm shadow-sm ${
          isVisitor
            ? "bg-accent text-accent-foreground rounded-2xl rounded-br-sm"
            : "bg-card text-card-foreground rounded-2xl rounded-bl-sm"
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            isVisitor ? "text-accent-foreground/60" : "text-muted-foreground"
          }`}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
