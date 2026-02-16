import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatHeader from "@/components/chat/ChatHeader";
import TypingIndicator from "@/components/chat/TypingIndicator";
import QuickReplies from "@/components/chat/QuickReplies";
import useNotificationSound from "@/components/chat/useNotificationSound";

const getSessionId = () => {
  let id = sessionStorage.getItem("visitor_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("visitor_session_id", id);
  }
  return id;
};

interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
}

const AUTO_GREETING = "Welcome to Emery Collection shop 👋 How can we assist you today?";

const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());
  const playSound = useNotificationSound();

  // Load or create conversation
  useEffect(() => {
    if (!open || !started) return;

    const init = async () => {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("visitor_session_id", sessionId.current)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1);

      let convId: string;
      if (existing && existing.length > 0) {
        convId = existing[0].id;
      } else {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ visitor_session_id: sessionId.current, visitor_name: name || "Visitor" })
          .select("id")
          .single();
        convId = newConv!.id;
      }
      setConversationId(convId);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (msgs) {
        setMessages(msgs);
        if (msgs.length > 0) setHasGreeted(true);
      }
    };
    init();
  }, [open, started]);

  // Auto greeting
  useEffect(() => {
    if (!conversationId || hasGreeted || messages.length > 0) return;
    setHasGreeted(true);
    setShowTyping(true);
    const timer = setTimeout(async () => {
      setShowTyping(false);
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_type: "admin",
        content: AUTO_GREETING,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [conversationId, hasGreeted, messages.length]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_type === "admin") {
            playSound();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, playSound]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || !conversationId) return;
    if (!text) setInput("");
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "visitor",
      content,
    });
  }, [input, conversationId]);

  const handleStart = () => {
    if (name.trim()) setStarted(true);
  };

  const showQuickReplies = messages.length <= 1 && started && conversationId;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl shadow-elevated border border-border overflow-hidden flex flex-col ${darkMode ? "dark" : ""}`}
            style={{ maxHeight: "75vh" }}
          >
            <div className={darkMode ? "dark bg-background text-foreground flex flex-col h-full" : "bg-background text-foreground flex flex-col h-full"}>
              <ChatHeader
                onClose={() => setOpen(false)}
                darkMode={darkMode}
                onToggleDark={() => setDarkMode(!darkMode)}
              />

              {!started ? (
                <div className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Welcome! Enter your name to start chatting with our team.
                  </p>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  />
                  <button
                    onClick={handleStart}
                    className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              ) : (
                <>
                  {/* Messages area with WhatsApp-style doodle background */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[220px] max-h-[400px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  >
                    {messages.length === 0 && !showTyping && (
                      <p className="text-xs text-muted-foreground text-center mt-8">
                        Starting your chat...
                      </p>
                    )}

                    {messages.map((m) => (
                      <ChatBubble
                        key={m.id}
                        content={m.content}
                        senderType={m.sender_type}
                        timestamp={m.created_at}
                      />
                    ))}

                    {showTyping && <TypingIndicator />}

                    {showQuickReplies && !showTyping && (
                      <div className="pt-2">
                        <QuickReplies onSelect={(text) => sendMessage(text)} />
                      </div>
                    )}

                    <div ref={bottomRef} />
                  </div>

                  {/* Input bar */}
                  <div className="p-3 border-t border-border bg-card flex gap-2 items-center">
                    <Input
                      placeholder="Type a message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="text-sm bg-background"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 group"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" style={{ animationDuration: "2s" }} />
        )}
        <span className="relative flex items-center justify-center h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-elevated transition-transform duration-200 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsla(38,60%,55%,0.4)]">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </>
  );
};

export default LiveChat;
