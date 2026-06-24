import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ScrollText, Filter } from "lucide-react";
import ReportCard from "@/components/ReportCard";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-2.5 sm:p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg bg-muted/50" />
        <div className="space-y-1.5 sm:space-y-2 flex-1">
          <div className="h-3 sm:h-4 bg-muted/50 rounded w-2/3" />
          <div className="h-2.5 sm:h-3 bg-muted/30 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <div className="h-2.5 sm:h-3 bg-muted/40 rounded w-full" />
        <div className="h-2.5 sm:h-3 bg-muted/40 rounded w-5/6 hidden sm:block" />
      </div>
      <div className="h-6 sm:h-8 bg-muted/30 rounded" />
    </div>
  );
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scamType, setScamType] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [severity, setSeverity] = useState("all");
  const searchRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.ScammerReport.filter({ status: "approved" }, "-created_date", 500);
        setReports(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();

    const unsubscribe = base44.entities.ScammerReport.subscribe((event) => {
      if (event.type === "delete") {
        setReports((prev) => prev.filter((r) => r.id !== event.data.id));
      } else if (event.type === "update") {
        if (event.data.status === "approved") {
          setReports((prev) => {
            const idx = prev.findIndex((r) => r.id === event.data.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = event.data;
              return next;
            }
            return [event.data, ...prev];
          });
        } else {
          setReports((prev) => prev.filter((r) => r.id !== event.data.id));
        }
      } else if (event.type === "create" && event.data.status === "approved") {
        setReports((prev) => [event.data, ...prev]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = reports.filter((r) => {
    const matchSearch =
      !search ||
      r.scammer_username?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = scamType === "all" || r.scam_type === scamType;
    const matchPlatform = platform === "all" || r.platform === platform;
    const matchSeverity = severity === "all" || r.severity === severity;
    return matchSearch && matchType && matchPlatform && matchSeverity;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <ScrollText className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            <h1 className="font-display text-xl sm:text-4xl font-bold">Scammer Watchlist</h1>
          </div>
          <p className="text-xs sm:text-base text-muted-foreground">{filtered.length} verified scammers in the database</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search by username or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 bg-card/50 backdrop-blur-sm"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 border border-border/50 rounded px-1.5 py-0.5 hidden sm:block">/</kbd>
          </div>
          <Select value={scamType} onValueChange={setScamType}>
            <SelectTrigger className="w-full sm:w-48 bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="Scam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Item Theft">Item Theft</SelectItem>
              <SelectItem value="Currency Scam">Currency Scam</SelectItem>
              <SelectItem value="Impersonation">Impersonation</SelectItem>
              <SelectItem value="Account Hacking">Account Hacking</SelectItem>
              <SelectItem value="False Trade">False Trade</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="Discord">Discord</SelectItem>
              <SelectItem value="Roblox">Roblox</SelectItem>
              <SelectItem value="In-Game">In-Game</SelectItem>
              <SelectItem value="Reddit">Reddit</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-1 text-sm">No scammers match your filters</p>
            <p className="text-xs text-muted-foreground/60">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {filtered.map((report, i) => (
              <ReportCard key={report.id} report={report} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}