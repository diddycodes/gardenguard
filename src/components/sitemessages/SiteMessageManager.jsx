import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Send, Sparkles, Megaphone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const ANIMATIONS = [
  { value: "confetti", label: "Confetti Burst" },
  { value: "floating_emojis", label: "Floating Emojis" },
  { value: "screen_shake", label: "Screen Shake" },
  { value: "rainbow_flash", label: "Rainbow Flash" },
  { value: "none", label: "No Animation" },
];

export default function SiteMessageManager({ adminName }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [content, setContent] = useState("");
  const [animType, setAnimType] = useState("confetti");

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SiteMessage.list("-created_date", 50);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.SiteMessage.create({
        content: content.trim(),
        animation_type: animType,
        active: true,
        created_by_name: adminName,
      });
      toast({ title: "Message posted!" });
      setContent("");
      load();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await base44.entities.SiteMessage.delete(id);
      toast({ title: "Message deleted" });
      load();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (msg) => {
    try {
      await base44.entities.SiteMessage.update(msg.id, { active: !msg.active });
      load();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-semibold text-lg">Post a Site Message</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message for everyone to see..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Animation</Label>
            <Select value={animType} onValueChange={setAnimType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={submitting || !content.trim()}
            className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Message
          </Button>
        </form>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-semibold text-lg">Active Messages</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 bg-card/30 backdrop-blur-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={msg.active ? "default" : "outline"}>
                          {msg.active ? "Active" : "Hidden"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {msg.created_by_name || "Admin"}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-muted-foreground mt-2 capitalize">
                        Animation: {msg.animation_type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(msg)}
                        className="text-xs"
                      >
                        {msg.active ? "Hide" : "Show"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(msg.id)}
                        disabled={deletingId === msg.id}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        {deletingId === msg.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}