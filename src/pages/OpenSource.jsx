import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Download, Lock, FileCode, GitBranch, Eye, Server, CheckCircle2, Search, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CodeBlock from "@/components/CodeBlock";
import { techStack, codeSnippets, trustPoints } from "@/lib/openSourceData";
import { fullFileTree, totalFiles } from "@/lib/fileTree";
import { sourceBundle } from "@/lib/sourceBundle";

export default function OpenSource() {
  const [search, setSearch] = useState("");
  const [expandedFolder, setExpandedFolder] = useState(null);

  const handleDownload = () => {
    const blob = new Blob([sourceBundle], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GardenGuard-FullSource.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group files by directory
  const grouped = useMemo(() => {
    const filtered = search
      ? fullFileTree.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
      : fullFileTree;

    const groups = {};
    for (const file of filtered) {
      const parts = file.name.split("/");
      const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "(root)";
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(file);
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [search]);

  const totalSize = useMemo(() => {
    return fullFileTree.reduce((acc, f) => acc + (f.size || 0), 0);
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            100% Open & Transparent
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold mb-4">
            Open Source
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            GardenGuard is built with transparency at its core. Every single file — all {totalFiles} of them —
            is listed below with its full source code available for download. Review it yourself. No black boxes, no hidden tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Button
              onClick={handleDownload}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary gap-2"
            >
              <Download className="w-4 h-4" />
              Download All Source Code ({formatSize(totalSize)})
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {totalFiles} files · {formatSize(totalSize)} of source code · Updated {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
        >
          {[
            { label: "Total Files", value: totalFiles, icon: FileCode, color: "text-primary" },
            { label: "Source Size", value: formatSize(totalSize), icon: Server, color: "text-secondary" },
            { label: "Entities", value: "6", icon: Lock, color: "text-accent" },
            { label: "Pages", value: "12", icon: GitBranch, color: "text-primary" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-card/40 border-border/50 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <div className="font-display text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Trust Points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-3 mb-12"
        >
          {trustPoints.map((point, i) => (
            <Card key={i} className="p-4 bg-card/40 border-border/50">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">{point.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{point.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Tech Stack</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/40 text-sm"
              >
                <span className="font-medium">{tech.name}</span>
                <span className="text-xs text-muted-foreground">{tech.category}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Full File Tree */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Complete File Tree</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="pl-9 h-9 bg-background/50"
              />
            </div>
          </div>

          <Card className="border-border/50 bg-card/40 overflow-hidden">
            <div className="p-4 space-y-2">
              {grouped.map(([folder, files]) => (
                <div key={folder} className="rounded-lg border border-border/30 bg-background/30 overflow-hidden">
                  <button
                    onClick={() => setExpandedFolder(expandedFolder === folder ? null : folder)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors"
                  >
                    {expandedFolder === folder ? (
                      <FolderOpen className="w-4 h-4 text-secondary" />
                    ) : (
                      <Folder className="w-4 h-4 text-secondary" />
                    )}
                    <span className="font-mono text-sm text-secondary font-medium">{folder}/</span>
                    <span className="ml-auto text-xs text-muted-foreground">{files.length} files</span>
                  </button>
                  {(expandedFolder === folder || search) && (
                    <div className="border-t border-border/20">
                      {files.map((file, fi) => {
                        const fileName = file.name.split("/").pop();
                        return (
                          <div
                            key={fi}
                            className="flex items-center gap-2 px-3 py-1.5 pl-10 hover:bg-muted/20 transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="font-mono text-xs text-foreground/80 truncate">{fileName}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground/60 shrink-0">
                              {file.error ? "binary" : formatSize(file.size)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {grouped.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No files match "{search}"
                </div>
              )}
            </div>
          </Card>

          <div className="mt-3 text-center">
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download All {totalFiles} Files as Source Bundle
            </Button>
          </div>
        </motion.div>

        {/* Security Policies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Security Policies (RLS)</h2>
          </div>
          <div className="space-y-6">
            {codeSnippets.map((snippet, i) => (
              <div key={i}>
                <div className="mb-2">
                  <h3 className="font-semibold text-sm mb-0.5">{snippet.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{snippet.description}</p>
                  <span className="font-mono text-xs text-secondary">{snippet.file}</span>
                </div>
                <CodeBlock code={snippet.code} language={snippet.language} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-8"
        >
          <Eye className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-3">See something? Say something.</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
            If you spot a vulnerability or have a concern about how data is handled, report it through the
            submit page and our admin team will investigate immediately.
          </p>
          <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Download className="w-4 h-4" />
            Download Complete Source Code
          </Button>
        </motion.div>
      </div>
    </div>
  );
}