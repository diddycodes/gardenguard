import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import RelativeTime from "@/components/RelativeTime";

const severityDot = {
  low: "bg-blue-400",
  medium: "bg-yellow-400",
  high: "bg-orange-400",
  critical: "bg-red-500",
};

export default function ReportCard({ report, index = 0 }) {
  const [copied, setCopied] = useState(false);
  const dot = severityDot[report.severity] || severityDot.medium;

  const copyUsername = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(report.scammer_username || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      whileHover={{ y: -2 }}
    >
      <Link to={`/reports/${report.id}`} className="block">
        <Card className="border-border/40 bg-card/40 hover:border-primary/30 hover:bg-card/60 transition-all p-2.5 sm:p-3.5 h-full">
          <div className="flex items-start gap-2 sm:gap-2.5">
            <span className={`mt-1 w-1.5 h-1.5 sm:mt-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${dot}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 min-w-0">
                  <h3 className="font-display font-semibold text-xs sm:text-sm truncate">{report.scammer_username}</h3>
                  <button onClick={copyUsername} className="text-muted-foreground/40 hover:text-primary transition-colors shrink-0">
                    {copied ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" /> : <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  </button>
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground/60 shrink-0">{report.platform}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">{report.description}</p>
              <div className="flex items-center justify-between mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-border/20">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 truncate">{report.scam_type}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 shrink-0 ml-1">
                  <RelativeTime date={report.created_at} />
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}