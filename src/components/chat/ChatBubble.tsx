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
      {!isVisitor && (
        <div className="w-7 h-7 rounded-full bg-[#0084ff] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-1.5 mt-auto">
          EC
        </div>
      )}
      <div
        className={`relative max-w-[75%] px-3 py-2 text-sm ${
          isVisitor
            ? "bg-[#0084ff] text-white rounded-[18px] rounded-br-[4px]"
            : "bg-card text-card-foreground rounded-[18px] rounded-bl-[4px] shadow-sm"
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
        <p
          className={`text-[10px] mt-0.5 text-right ${
            isVisitor ? "text-white/60" : "text-muted-foreground"
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
