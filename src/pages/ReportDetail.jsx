import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck, Flame, AlertTriangle, ArrowLeft, User as UserIcon, Calendar, FileImage } from "lucide-react";
import ReportComments from "@/components/ReportComments";

const severityConfig = {
  low: { color: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "Low", icon: AlertTriangle },
  medium: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", label: "Medium", icon: AlertTriangle },
  high: { color: "bg-orange-500/10 text-orange-400 border-orange-500/30", label: "High", icon: Flame },
  critical: { color: "bg-red-500/10 text-red-400 border-red-500/30", label: "Critical", icon: Flame },
};

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approverName, setApproverName] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.ScammerReport.get(id);
        setReport(data);
        if (data.approved_by_id) {
          try {
            const approver = await base44.entities.User.get(data.approved_by_id);
            const name = approver?.display_name || approver?.full_name || approver?.email?.split("@")[0];
            if (name) setApproverName(name);
          } catch {
            /* fall back to stored approved_by string */
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Report not found</h2>
          <Link to="/reports">
            <Button variant="outline" className="gap-2 mt-2">
              <ArrowLeft className="w-4 h-4" /> Back to Watchlist
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const sev = severityConfig[report.severity] || severityConfig.medium;
  const SevIcon = sev.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/reports">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Watchlist
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-7 h-7 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight break-words">
                    {report.scammer_username}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary">{report.platform}</Badge>
                    <Badge variant="outline">{report.scam_type}</Badge>
                    <Badge variant="outline" className={`${sev.color} gap-1`}>
                      <SevIcon className="w-3 h-3" />
                      {sev.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    What Happened
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                {report.evidence_files?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      Evidence ({report.evidence_files.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {report.evidence_files.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${i + 1}`}
                            className="w-full h-32 sm:h-40 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Reported by</p>
                      <p className="font-medium truncate">{report.reported_by_name || "Anonymous"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Reported on</p>
                      <p className="font-medium">
                        {report.created_date
                          ? new Date(report.created_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {report.approved_by && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-primary">Verified by Admin</p>
                      <p className="text-xs text-muted-foreground">
                        This report was reviewed and approved by {approverName || report.approved_by}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <ReportComments reportId={report.id} />
        </motion.div>
      </div>
    </div>
  );
}