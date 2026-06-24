import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 mt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm">GardenGuard — Stay safe out there.</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/reports" className="hover:text-primary transition-colors">Watchlist</Link>
          <Link to="/submit" className="hover:text-primary transition-colors">Report</Link>
          <Link to="/chat" className="hover:text-primary transition-colors">Chat</Link>
        </div>
      </div>
    </footer>
  );
}