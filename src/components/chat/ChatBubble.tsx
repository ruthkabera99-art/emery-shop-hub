import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

interface ChatBubbleProps {
  content: string;
  senderType: string;
  timestamp: string;
  status?: string;
  readAt?: string | null;
}

const StatusIcon = ({ status, readAt }: { status?: string; readAt?: string | null }) => {
  if (readAt || status === "read") {
    return <CheckCheck className="h-3.5 w-3.5 text-[#0084ff]" />;
  }
  if (status === "delivered") {
    return <CheckCheck className="h-3.5 w-3.5 text-white/50" />;
  }
  return <Check className="h-3.5 w-3.5 text-white/50" />;
};

const ChatBubble = ({ content, senderType, timestamp, status, readAt }: ChatBubbleProps) => {
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
        <div
          className={`flex items-center gap-1 mt-0.5 justify-end ${
            isVisitor ? "text-white/60" : "text-muted-foreground"
          }`}
        >
          <span className="text-[10px]">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isVisitor && <StatusIcon status={status} readAt={readAt} />}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
