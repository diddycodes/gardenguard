import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ScrollText, Plus, ShieldCheck, Eye, Zap, ChevronRight } from "lucide-react";
import TopScammers from "@/components/TopScammers";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [approvedReports, setApprovedReports] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.ScammerReport.list("-created_date", 500);
        const approved = all.filter((r) => r.status === "approved");
        const pending = all.filter((r) => r.status === "pending").length;
        setStats({ total: all.length, approved: approved.length, pending });
        setApprovedReports(approved);
      } catch (e) {
        /* app might have no reports yet */
      }
    })();
  }, []);

  return (
    <div className="relative">
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            Grow a Garden 2 Scammer Database
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Don't get
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              scammed.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Community-driven scammer watchlist for Grow a Garden 2. Report scammers, upload evidence,
            and protect fellow players. Every report verified by our admin team.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/reports">
              <Button size="lg" variant="outline" className="group gap-2 w-full sm:w-auto">
                <ScrollText className="w-4 h-4" />
                Browse Watchlist
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/submit">
              <Button
                size="lg"
                className="group gap-2 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                <Plus className="w-4 h-4" />
                Report a Scammer
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto"
          >
            {[
              { label: "Total Reports", value: stats.total, icon: ScrollText, color: "text-primary" },
              { label: "Verified", value: stats.approved, icon: ShieldCheck, color: "text-secondary" },
              { label: "Pending Review", value: stats.pending, icon: Eye, color: "text-accent" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Three steps to a safer community</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Plus, title: "Submit a Report", desc: "Caught a scammer? File a report with screenshots and evidence.", color: "text-primary" },
              { icon: ShieldCheck, title: "Admin Review", desc: "Our admin team verifies every report before it goes live.", color: "text-secondary" },
              { icon: Eye, title: "Stay Protected", desc: "Browse the verified watchlist before trading with anyone.", color: "text-accent" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 hover:border-primary/30 transition-colors"
              >
                <div className="text-5xl font-display font-bold text-muted-foreground/10 absolute top-4 right-4">
                  0{i + 1}
                </div>
                <step.icon className={`w-8 h-8 ${step.color} mb-4`} />
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TopScammers reports={approvedReports} />

      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-primary/20 bg-primary/5 p-10 backdrop-blur-sm"
        >
          <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-3">Got scammed?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Don't let them get away with it. Report them now and warn the community.
          </p>
          <Link to="/submit">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary gap-2">
              <Plus className="w-4 h-4" />
              File a Report
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}