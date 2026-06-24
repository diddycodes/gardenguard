import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Megaphone } from "lucide-react";
import FunnyAnimation from "./FunnyAnimation";

const STORAGE_KEY = "gg_seen_animations";

export default function SiteMessageDisplay() {
  const [messages, setMessages] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [playedAnims, setPlayedAnims] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.SiteMessage.list("-created_date", 20);
        const active = data.filter((m) => m.active);
        setMessages(active);

        const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        setPlayedAnims(new Set(seen));
      } catch (e) {
        /* entity may not exist yet */
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const markSeen = (msgId) => {
    const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!seen.includes(msgId)) {
      seen.push(msgId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
      setPlayedAnims((prev) => new Set([...prev, msgId]));
    }
  };

  const dismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visible = messages.filter((m) => !dismissed.has(m.id));

  return (
    <>
      <AnimatePresence>
        {visible.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onAnimationComplete={() => {
              if (msg.animation_type !== "none" && !playedAnims.has(msg.id)) {
                markSeen(msg.id);
              }
            }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-3xl"
          >
            <div className="rounded-xl border border-secondary/30 bg-card/90 backdrop-blur-xl shadow-lg p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-secondary" />
              </div>
              <p className="flex-1 text-sm font-medium">{msg.content}</p>
              <button
                onClick={() => dismiss(msg.id)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {visible.map((msg) => {
        if (msg.animation_type === "none") return null;
        if (playedAnims.has(msg.id)) return null;
        return <FunnyAnimation key={`anim-${msg.id}`} type={msg.animation_type} />;
      })}
    </>
  );
}