import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, Send } from "lucide-react";
import CommentItem from "@/components/CommentItem";

export default function ReportComments({ reportId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.ReportComment.filter({ report_id: reportId }, "created_date", 200);
        setComments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();

    const unsubscribe = base44.entities.ReportComment.subscribe((event) => {
      if (event.type === "create" && event.data?.report_id === reportId) {
        setComments((prev) => [...prev, event.data]);
      }
    });

    return () => unsubscribe();
  }, [reportId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");
    try {
      await base44.entities.ReportComment.create({
        report_id: reportId,
        content,
        author_name: user?.display_name || user?.full_name || user?.email?.split("@")[0] || "Anonymous",
        author_avatar: user?.pfp_url || "",
      });
    } catch (e) {
      console.error(e);
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-secondary" />
          <h3 className="font-display text-lg font-semibold">Victim Discussion</h3>
          {comments.length > 0 && (
            <span className="text-xs text-muted-foreground ml-1">({comments.length})</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Share extra details or discuss your experience with other victims.
        </p>
      </div>

      <div ref={scrollRef} className="p-5 space-y-4 max-h-[28rem] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to share.</p>
          </div>
        ) : (
          comments.map((c) => <CommentItem key={c.id} comment={c} />)
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSend} className="border-t border-border/30 p-4 space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your experience..."
            maxLength={1000}
            rows={2}
            className="bg-background/50 resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!input.trim() || sending} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-border/30 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">Log in to join the discussion</p>
          <Link to="/login">
            <Button size="sm" variant="outline">Log in</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}