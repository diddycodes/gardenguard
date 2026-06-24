import { motion } from "framer-motion";
import { ShieldCheck, Trash2 } from "lucide-react";

function renderContent(content, senderIsAdmin) {
  if (!content) return null;
  if (!senderIsAdmin) return content;
  const parts = content.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary/80 break-all">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatMessage({ message, isOwn, isAdmin, onDelete }) {
  const avatar = message.sender_avatar;
  const name = message.sender_name || "Anonymous";
  const senderIsAdmin = message.sender_role === "admin";
  const hasAttachment = !!message.attachment_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      {avatar ? (
        <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`flex items-center gap-1.5 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-xs font-medium text-foreground/80">{name}</span>
          {senderIsAdmin && (
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          )}
          {(isAdmin || isOwn) && onDelete && (
            <button
              onClick={() => onDelete(message)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        {hasAttachment && (
          <img
            src={message.attachment_url}
            alt="attachment"
            className="rounded-2xl max-w-[240px] max-h-[300px] object-cover border border-border/50 mb-1"
          />
        )}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-2 text-sm break-words ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-card border border-border/50 rounded-tl-sm"
            }`}
          >
            {renderContent(message.content, senderIsAdmin)}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : ""}
        </span>
      </div>
    </motion.div>
  );
}