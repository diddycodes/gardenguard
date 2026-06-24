import { motion } from "framer-motion";

export default function CommentItem({ comment }) {
  const avatar = comment.author_avatar;
  const name = comment.author_name || "Anonymous";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {avatar ? (
        <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="text-xs font-medium text-foreground/80 mb-0.5">{name}</p>
          <p className="text-sm text-foreground/90 break-words whitespace-pre-wrap">{comment.content}</p>
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
          {comment.created_at
            ? new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
              " at " +
              new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : ""}
        </span>
      </div>
    </motion.div>
  );
}