import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatHeader from "@/components/chat/ChatHeader";
import TypingIndicator from "@/components/chat/TypingIndicator";
import QuickReplies from "@/components/chat/QuickReplies";
import useNotificationSound from "@/components/chat/useNotificationSound";

const getSessionId = () => {
  // Use localStorage so the chat session survives page refreshes & browser restarts
  let id = localStorage.getItem("visitor_session_id");
  if (!id) {
    // migrate old sessionStorage value if present
    const legacy = sessionStorage.getItem("visitor_session_id");
    id = legacy || crypto.randomUUID();
    localStorage.setItem("visitor_session_id", id);
  }
  return id;
};

const getStoredName = () => localStorage.getItem("visitor_name") || "";
const getStoredStarted = () => localStorage.getItem("visitor_chat_started") === "1";

// Smart auto-reply keyword matching
const getSmartReply = (text: string): string => {
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|hola|salut)\b/.test(t))
    return "Hi there! 👋 Thanks for reaching out to Emery Collection. How can I help you today?";
  if (/(price|cost|how much|pricing)/.test(t))
    return "Our prices are listed on each product page. You can browse our shop here: /shop — would you like a recommendation?";
  if (/(ship|delivery|deliver|arrive)/.test(t))
    return "We ship within 2–5 business days 📦. Tracking info is sent to your email once your order is dispatched.";
  if (/(return|refund|exchange)/.test(t))
    return "We offer easy returns within 14 days of delivery. Just keep the item unused and in its original packaging 👍";
  if (/(payment|pay|card|mpesa|paypal|stripe)/.test(t))
    return "We accept all major cards, PayPal, and mobile money. All payments are securely processed at checkout 🔒";
  if (/(stock|available|availability|in stock)/.test(t))
    return "Most items shown on the shop are in stock. If you tell me which product you're interested in, I'll confirm right away!";
  if (/(size|fit|sizing)/.test(t))
    return "You can find detailed size guides on each product page. If you share your usual size, I can suggest the best fit 👟";
  if (/(contact|email|phone|whatsapp|number)/.test(t))
    return "You can reach us anytime through this chat, or via our Contact page. We usually respond within minutes during business hours.";
  if (/(thank|thanks|asante)/.test(t))
    return "You're very welcome! 💙 Let me know if there's anything else I can help with.";
  if (/(book|order|buy|purchase)/.test(t))
    return "Great choice! 🎉 Add the item to your cart and proceed to checkout. I'll be here if you need help during the process.";
  return "Thanks for your message! Our team will get back to you shortly. In the meantime, feel free to ask about our products, shipping, or returns 😊";
};

interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
  status?: string;
  read_at?: string | null;
}

const AUTO_GREETING = "Welcome to Emery Collection shop 👋 How can we assist you today?";

// Messenger SVG icon
const MessengerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 28 28" fill="currentColor" className={className}>
    <path d="M14 2.042c-6.76 0-12 4.952-12 11.64S7.24 25.322 14 25.322a12.73 12.73 0 0 0 4.028-.657l3.404 1.308a.85.85 0 0 0 1.107-.903l-.353-2.837c1.79-1.886 2.814-4.27 2.814-6.892C25 6.994 20.76 2.042 14 2.042Z" />
    <path d="m8.476 15.593 2.56-4.063a1.5 1.5 0 0 1 2.092-.404l2.036 1.527a.6.6 0 0 0 .723 0l2.749-2.086a.474.474 0 0 1 .687.633l-2.56 4.063a1.5 1.5 0 0 1-2.093.404l-2.035-1.527a.6.6 0 0 0-.723 0l-2.75 2.086a.474.474 0 0 1-.686-.633Z" fill="white" />
  </svg>
);

const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [name, setName] = useState(getStoredName);
  const [started, setStarted] = useState(getStoredStarted);
  const [showTyping, setShowTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());
  const playSound = useNotificationSound();
  const autoReplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load conversation as soon as the user has started (survives refresh via localStorage)
  useEffect(() => {
    if (!started) return;

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
  }, [started]);

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

  // Mark admin messages as read when chat is open
  useEffect(() => {
    if (!open || !conversationId) return;
    const unreadAdmin = messages.filter(
      (m) => m.sender_type === "admin" && m.status !== "read" && !m.read_at
    );
    if (unreadAdmin.length > 0) {
      const ids = unreadAdmin.map((m) => m.id);
      supabase
        .from("messages")
        .update({ status: "read", read_at: new Date().toISOString(), is_read: true })
        .in("id", ids)
        .then();
    }
  }, [open, messages, conversationId]);

  // Track which visitor messages have already triggered an auto-reply (persisted)
  const autoRepliedKey = conversationId ? `auto_replied_${conversationId}` : null;
  const autoRepliedFor = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!autoRepliedKey) return;
    try {
      const stored = JSON.parse(localStorage.getItem(autoRepliedKey) || "[]");
      autoRepliedFor.current = new Set(stored);
    } catch {
      autoRepliedFor.current = new Set();
    }
  }, [autoRepliedKey]);

  const markAutoReplied = (msgId: string) => {
    autoRepliedFor.current.add(msgId);
    if (autoRepliedKey) {
      localStorage.setItem(autoRepliedKey, JSON.stringify([...autoRepliedFor.current]));
    }
  };

  // Realtime: messages + admin-typing broadcast
  const [adminTyping, setAdminTyping] = useState(false);
  const adminTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      )
      .subscribe();

    // Separate channel for typing broadcasts from the admin panel
    const typingChannel = supabase
      .channel(`typing-${conversationId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "typing" }, (payload) => {
        const isTyping = !!(payload.payload as any)?.typing;
        setAdminTyping(isTyping);
        if (adminTypingTimeout.current) clearTimeout(adminTypingTimeout.current);
        if (isTyping) {
          // Admin is actively typing — cancel any pending auto-reply
          if (autoReplyTimer.current) {
            clearTimeout(autoReplyTimer.current);
            autoReplyTimer.current = null;
          }
          // Auto-clear after 4s of no further typing events
          adminTypingTimeout.current = setTimeout(() => setAdminTyping(false), 4000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
      if (adminTypingTimeout.current) clearTimeout(adminTypingTimeout.current);
    };
  }, [conversationId, playSound]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping, adminTyping]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || !conversationId) return;
    if (!text) setInput("");

    // Cancel any pending auto-reply (only the latest message should trigger one)
    if (autoReplyTimer.current) {
      clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = null;
    }

    const { data } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "visitor",
      content,
      status: "sent",
    }).select("id").single();

    const insertedId = data?.id;
    if (insertedId) {
      await supabase.from("messages").update({ status: "delivered" }).eq("id", insertedId);
    }

    // Smart auto-reply: only if this message hasn't already been auto-replied to
    if (insertedId && autoRepliedFor.current.has(insertedId)) return;

    setShowTyping(true);
    autoReplyTimer.current = setTimeout(async () => {
      setShowTyping(false);
      autoReplyTimer.current = null;
      if (!insertedId || autoRepliedFor.current.has(insertedId)) return;
      // Mark BEFORE the insert to prevent any race / duplicate
      markAutoReplied(insertedId);
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_type: "admin",
        content: getSmartReply(content),
      });
    }, 2000);
  }, [input, conversationId, autoRepliedKey]);

  // If a real admin replies, cancel any pending auto-reply for the most recent visitor message
  useEffect(() => {
    if (!autoReplyTimer.current) return;
    const last = messages[messages.length - 1];
    if (last && last.sender_type === "admin") {
      clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = null;
      setShowTyping(false);
      // Also mark the latest visitor message as auto-replied so it never triggers later
      const lastVisitor = [...messages].reverse().find((m) => m.sender_type === "visitor");
      if (lastVisitor) markAutoReplied(lastVisitor.id);
    }
  }, [messages]);

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("visitor_name", trimmed);
    localStorage.setItem("visitor_chat_started", "1");
    setStarted(true);
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
            className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col ${darkMode ? "dark" : ""}`}
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
                  <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 rounded-full bg-[#0084ff] flex items-center justify-center">
                      <MessengerIcon className="h-9 w-9 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Chat with Emery Collection! Enter your name to get started.
                  </p>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
                    className="rounded-full px-4"
                  />
                  <button
                    onClick={handleStart}
                    className="w-full py-2.5 rounded-full bg-[#0084ff] text-white font-semibold text-sm hover:bg-[#0073e6] transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[220px] max-h-[400px] bg-muted/30"
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
                        status={m.status}
                        readAt={m.read_at}
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

                  {/* Messenger-style input bar */}
                  <div className="p-2 border-t border-border bg-card flex gap-2 items-center">
                    <Input
                      placeholder="Aa"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="text-sm bg-muted/50 rounded-full px-4 border-0 focus-visible:ring-1 focus-visible:ring-[#0084ff]"
                    />
                    <button
                      onClick={() => input.trim() ? sendMessage() : sendMessage("👍")}
                      className="h-9 w-9 rounded-full bg-[#0084ff] text-white flex items-center justify-center hover:bg-[#0073e6] transition-colors shrink-0"
                    >
                      {input.trim() ? (
                        <Send className="h-4 w-4" />
                      ) : (
                        <ThumbsUp className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messenger-style Floating Action Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 group"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#0084ff]/30 animate-ping" style={{ animationDuration: "2s" }} />
        )}
        <span className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[#0084ff] text-white shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(0,132,255,0.5)]">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessengerIcon className="h-7 w-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </>
  );
};

export default LiveChat;
