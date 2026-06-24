import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { uploadFile } from "@/lib/uploadFile";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, Plus, AlertTriangle } from "lucide-react";

export default function SubmitReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [evidence, setEvidence] = useState([]);

  const [form, setForm] = useState({
    scammer_username: "",
    platform: "",
    scam_type: "",
    description: "",
    severity: "medium",
  });

  const handleUpload = async (files) => {
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const url = await uploadFile(file);
        setEvidence((prev) => [...prev, url]);
      }
    } catch (e) {
      setError("Failed to upload file(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.scammer_username || !form.description || !form.scam_type || !form.platform) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("scammer_reports").insert({
        ...form,
        evidence_files: evidence,
        status: "pending",
        reported_by_name:
          user?.display_name || user?.full_name || user?.email?.split("@")[0] || "Anonymous",
        created_by_id: user?.id,
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate("/reports"), 2000);
    } catch (e) {
      setError(e.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-primary">
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Report Submitted!</h2>
          <p className="text-muted-foreground">
            Your report is now pending admin review. You'll be redirected shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Plus className="w-7 h-7 text-primary" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Report a Scammer</h1>
          </div>
          <p className="text-muted-foreground">Help protect the community. All reports are reviewed by admins.</p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Scammer Username *</Label>
              <Input
                placeholder="e.g. xXScammerXx"
                value={form.scammer_username}
                onChange={(e) => setForm({ ...form, scammer_username: e.target.value })}
                className="bg-card/50 backdrop-blur-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Platform *</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })} required>
                <SelectTrigger className="bg-card/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Discord">Discord</SelectItem>
                  <SelectItem value="Roblox">Roblox</SelectItem>
                  <SelectItem value="In-Game">In-Game</SelectItem>
                  <SelectItem value="Reddit">Reddit</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Scam Type *</Label>
              <Select value={form.scam_type} onValueChange={(v) => setForm({ ...form, scam_type: v })} required>
                <SelectTrigger className="bg-card/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Item Theft">Item Theft</SelectItem>
                  <SelectItem value="Currency Scam">Currency Scam</SelectItem>
                  <SelectItem value="Impersonation">Impersonation</SelectItem>
                  <SelectItem value="Account Hacking">Account Hacking</SelectItem>
                  <SelectItem value="False Trade">False Trade</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Severity</Label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                <SelectTrigger className="bg-card/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Description *</Label>
            <Textarea
              placeholder="Describe what happened in detail. When, where, and how did the scam occur?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-card/50 backdrop-blur-sm min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Evidence (Screenshots / Files)</Label>
            <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center bg-card/30 backdrop-blur-sm">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleUpload(Array.from(e.target.files))}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Click to upload evidence"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              </label>
            </div>

            {evidence.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {evidence.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-border/50"
                    />
                    <button
                      type="button"
                      onClick={() => setEvidence((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary gap-2"
            disabled={loading || uploading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Submit Report
              </>
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
