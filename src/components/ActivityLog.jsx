import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, Check, X, Trash2 } from "lucide-react";

const actionConfig = {
  approved: { icon: Check, color: "text-primary", badge: "bg-primary/10 text-primary border-primary/30", label: "Approved" },
  rejected: { icon: X, color: "text-red-400", badge: "bg-red-500/10 text-red-400 border-red-500/30", label: "Rejected" },
  deleted: { icon: Trash2, color: "text-red-400", badge: "bg-red-500/10 text-red-400 border-red-500/30", label: "Deleted" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("admin_activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, i) => {
            const cfg = actionConfig[log.action] || actionConfig.approved;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="flex items-center gap-4 border-border/50 bg-card/30 backdrop-blur-sm p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted/50 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{log.admin_name}</span>
                      <Badge variant="outline" className={`text-xs ${cfg.badge}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Report: <span className="text-foreground/70">{log.report_username || "Unknown"}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {timeAgo(log.created_at)}
                  </span>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
