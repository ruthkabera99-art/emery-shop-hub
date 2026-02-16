import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());

  // Load or create conversation
  useEffect(() => {
    if (!open || !started) return;

    const init = async () => {
      // Check existing conversation
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

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs);
    };
    init();
  }, [open, started]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === (payload.new as Message).id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    const content = input.trim();
    setInput("");
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "visitor",
      content,
    });
  };

  const handleStart = () => {
    if (name.trim()) setStarted(true);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Emery Collection</p>
                <p className="text-xs opacity-75">We typically reply in minutes</p>
              </div>
              <button onClick={() => setOpen(false)} className="hover:opacity-75">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!started ? (
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">Welcome! Enter your name to start chatting.</p>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                />
                <Button onClick={handleStart} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Start Chat
                </Button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-8">Send a message to get started!</p>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_type === "visitor" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          m.sender_type === "visitor"
                            ? "bg-accent text-accent-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        {m.content}
                        <p className="text-[10px] opacity-60 mt-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="text-sm"
                  />
                  <Button size="icon" onClick={sendMessage} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-full shadow-elevated hover:bg-accent/90 transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="text-sm font-semibold hidden sm:inline">{open ? "Close" : "Chat with us"}</span>
      </motion.button>
    </>
  );
};

export default LiveChat;
