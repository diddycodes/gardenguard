import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, MessageCircle, Users, ImagePlus, X } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.ChatMessage.list("-created_date", 50);
        setMessages(data.reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();

    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === "create") {
        setMessages((prev) => [...prev, event.data]);
      } else if (event.type === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if ((!content && !attachment) || sending) return;

    setSending(true);
    setInput("");
    try {
      await base44.entities.ChatMessage.create({
        content: content || "",
        sender_name: user?.display_name || user?.full_name || user?.email?.split("@")[0] || "Anonymous",
        sender_avatar: user?.pfp_url || "",
        sender_role: isAdmin ? "admin" : "user",
        attachment_url: attachment || "",
      });
      setAttachment(null);
    } catch (e) {
      console.error(e);
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentUpload = async (file) => {
    setUploadingAttachment(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachment(file_url);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDelete = async (msg) => {
    try {
      await base44.entities.ChatMessage.delete(msg.id);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Global Chat</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Live community chat
              </p>
            </div>
          </div>
        </motion.div>

        <Card className="flex-1 flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isOwn={msg.created_by_id === user?.id}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleSend} className="border-t border-border/50 p-3 space-y-2">
              {attachment && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <img src={attachment} alt="" className="w-12 h-12 rounded object-cover" />
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" /> Remove
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                {isAdmin && (
                  <label className="cursor-pointer flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && handleAttachmentUpload(e.target.files[0])}
                    />
                    <div className="h-9 w-9 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors">
                      {uploadingAttachment ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    </div>
                  </label>
                )}
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="bg-background/50"
                />
                <Button type="submit" size="icon" disabled={(!input.trim() && !attachment) || sending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          ) : (
            <div className="border-t border-border/50 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Log in to join the conversation</p>
              <Link to="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Log in
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}