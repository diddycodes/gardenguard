import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, X, Clock, Check, ShieldAlert, Trash2, History, Layers, TrendingUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import ActivityLog from "@/components/ActivityLog";
import SiteMessageManager from "@/components/sitemessages/SiteMessageManager";
import { Megaphone } from "lucide-react";

const logAction = (action, adminName, report) =>
  supabase.from("admin_activity_log").insert({
    action,
    admin_name: adminName,
    report_username: report?.scammer_username || "",
    report_id: report?.id || "",
  }).then(() => {}).catch(() => {});

export default function AdminPanel() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [tab, setTab] = useState("pending");

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scammer_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") loadReports();
  }, [user]);

  if (user && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const adminName = user?.display_name || user?.full_name || user?.email?.split("@")[0] || "Admin";

  const handleApprove = async (id) => {
    const report = reports.find((r) => r.id === id);
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("scammer_reports")
        .update({ status: "approved", approved_by: adminName, approved_by_id: user?.id || null })
        .eq("id", id);
      if (error) throw error;
      await logAction("approved", adminName, report);
      toast({ title: "Report approved!" });
      loadReports();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    const report = reports.find((r) => r.id === id);
    setActionLoading(id);
    try {
      const { error } = await supabase.from("scammer_reports").delete().eq("id", id);
      if (error) throw error;
      await logAction("deleted", adminName, report);
      toast({ title: "Report deleted" });
      loadReports();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const report = reports.find((r) => r.id === id);
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("scammer_reports")
        .update({ status: "rejected", approved_by: adminName })
        .eq("id", id);
      if (error) throw error;
      await logAction("rejected", adminName, report);
      toast({ title: "Report rejected" });
      loadReports();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const pending = reports.filter((r) => r.status === "pending");
  const approved = reports.filter((r) => r.status === "approved");
  const rejected = reports.filter((r) => r.status === "rejected");
  const current = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === current.length ? new Set() : new Set(current.map((r) => r.id))
    );
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulkApprove = async () => {
    const ids = [...selected];
    const toApprove = ids.filter((id) => {
      const r = reports.find((x) => x.id === id);
      return r && r.status === "pending";
    });
    if (toApprove.length === 0) {
      toast({ title: "No pending reports selected", description: "Only pending reports can be approved.", variant: "destructive" });
      return;
    }
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from("scammer_reports")
        .update({ status: "approved", approved_by: adminName, approved_by_id: user?.id || null })
        .in("id", toApprove);
      if (error) throw error;
      await Promise.all(
        toApprove.map((id) => {
          const r = reports.find((x) => x.id === id);
          return logAction("approved", adminName, r);
        })
      );
      toast({ title: `${toApprove.length} report(s) approved!` });
      clearSelection();
      loadReports();
    } catch (e) {
      toast({ title: "Bulk approve failed", description: e.message, variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        ids.map((id) => {
          const r = reports.find((x) => x.id === id);
          return logAction("deleted", adminName, r);
        })
      );
      const { error: delError } = await supabase.from("scammer_reports").delete().in("id", ids);
      if (delError) throw delError;
      toast({ title: `${ids.length} report(s) deleted` });
      clearSelection();
      loadReports();
    } catch (e) {
      toast({ title: "Bulk delete failed", description: e.message, variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    approved: "bg-primary/10 text-primary border-primary/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const sevDot = {
    low: "bg-blue-400",
    medium: "bg-yellow-400",
    high: "bg-orange-400",
    critical: "bg-red-500",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Review and manage scammer reports</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Pending", value: pending.length, icon: Clock, color: "text-yellow-400", bg: "border-yellow-500/20 bg-yellow-500/5" },
            { label: "Approved", value: approved.length, icon: Check, color: "text-primary", bg: "border-primary/20 bg-primary/5" },
            { label: "Rejected", value: rejected.length, icon: X, color: "text-red-400", bg: "border-red-500/20 bg-red-500/5" },
            { label: "Total", value: reports.length, icon: Layers, color: "text-secondary", bg: "border-secondary/20 bg-secondary/5" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border ${s.bg} backdrop-blur-sm p-4 flex items-center gap-3`}
            >
              <div className="w-9 h-9 rounded-lg bg-background/40 flex items-center justify-center">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <div className="font-display text-xl font-bold leading-none">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" /> Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <Check className="w-4 h-4" /> Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <X className="w-4 h-4" /> Rejected ({rejected.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <Megaphone className="w-4 h-4" /> Messages
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <History className="w-4 h-4" /> Activity
            </TabsTrigger>
          </TabsList>

          {tab === "messages" ? (
            <SiteMessageManager adminName={adminName} />
          ) : tab === "activity" ? (
            <ActivityLog />
          ) : loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : current.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No {tab} reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selected.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky top-20 z-10 flex flex-wrap items-center gap-3 p-4 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl"
                >
                  <span className="text-sm font-medium">{selected.size} selected</span>
                  <div className="flex items-center gap-2 ml-auto">
                    {tab === "pending" && (
                      <Button
                        size="sm"
                        onClick={handleBulkApprove}
                        disabled={bulkLoading}
                        className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                        Approve Selected
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDelete}
                      disabled={bulkLoading}
                      className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Delete Selected
                    </Button>
                    <Button size="sm" variant="ghost" onClick={clearSelection} disabled={bulkLoading}>
                      Clear
                    </Button>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-3 px-1">
                <Checkbox
                  checked={current.length > 0 && selected.size === current.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-xs text-muted-foreground">Select all ({current.length})</span>
              </div>

              {current.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border transition-colors ${
                    selected.has(report.id) ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card/30"
                  } backdrop-blur-sm`}
                >
                  <Card className="border-0 bg-transparent shadow-none p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selected.has(report.id)}
                          onCheckedChange={() => toggleSelect(report.id)}
                          className="mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-semibold text-lg">{report.scammer_username}</h3>
                          <Badge variant="outline" className={statusColors[report.status]}>
                            {report.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{report.platform}</span>
                          <span>•</span>
                          <span>{report.scam_type}</span>
                          <span>•</span>
                          <span className="capitalize">{report.severity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                    <p className="text-sm text-muted-foreground mb-3">{report.description}</p>

                    {report.evidence_files?.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto">
                        {report.evidence_files.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Evidence ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-border/50 flex-shrink-0"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">
                        Reported by {report.reported_by_name || "Anonymous"}
                      </span>
                      <div className="flex items-center gap-2">
                        {report.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(report.id)}
                              disabled={actionLoading === report.id}
                              className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              {actionLoading === report.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(report.id)}
                              disabled={actionLoading === report.id}
                              className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {actionLoading === report.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              Approve
                            </Button>
                          </>
                        )}
                        {report.approved_by && report.status !== "pending" && (
                          <span className="text-xs text-muted-foreground">
                            Reviewed by <span className="text-primary">{report.approved_by}</span>
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(report.id)}
                          disabled={actionLoading === report.id}
                          className="gap-1 text-red-400 hover:bg-red-500/10 hover:text-red-400 ml-auto"
                        >
                          {actionLoading === report.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}