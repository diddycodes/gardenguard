import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Trophy, AlertTriangle } from "lucide-react";

const rankStyles = [
  "border-yellow-500/30 bg-yellow-500/5",
  "border-gray-400/30 bg-gray-400/5",
  "border-orange-600/30 bg-orange-600/5",
];

export default function TopScammers({ reports }) {
  const counts = {};
  reports.forEach((r) => {
    const name = r.scammer_username?.trim();
    if (!name) return;
    counts[name] = (counts[name] || 0) + 1;
  });

  const top = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Most Reported
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Top 5 Scammers</h2>
          <p className="text-muted-foreground">The most frequently reported scammers on the watchlist</p>
        </motion.div>

        {top.length === 0 ? (
          <Card className="border-border/50 bg-card/30 p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No verified scammers yet. Be the first to report one!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {top.map((scammer, i) => (
              <motion.div
                key={scammer.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to="/reports">
                  <Card className={`flex items-center gap-4 p-4 border ${rankStyles[i] || "border-border/50 bg-card/30"} backdrop-blur-sm hover:border-primary/30 transition-colors`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-500" : "text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{scammer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {scammer.count} report{scammer.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {i < 3 && <Trophy className={`w-5 h-5 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : "text-orange-500"}`} />}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}