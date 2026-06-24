import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User as UserIcon, Key, Save, Camera, Mail } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";

export default function Profile() {
  const { user, checkUserAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStep, setPwStep] = useState("form");
  const [pwCode, setPwCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);

  const [profile, setProfile] = useState({
    display_name: "",
    username: "",
    pfp_url: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        display_name: user.display_name || "",
        username: user.username || "",
        pfp_url: user.pfp_url || "",
      });
    }
  }, [user]);

  const handlePfpUpload = async (file) => {
    setUploadingPfp(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfile((prev) => ({ ...prev, pfp_url: file_url }));
      await base44.auth.updateMe({ pfp_url: file_url });
      await checkUserAuth();
      toast({ title: "Profile picture updated!" });
    } catch (e) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploadingPfp(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const oldName = user.display_name || user.full_name || "";
      await base44.auth.updateMe({
        display_name: profile.display_name,
        username: profile.username,
      });
      if (profile.display_name !== oldName && user?.id) {
        await base44.entities.ScammerReport.updateMany(
          { approved_by_id: user.id },
          { $set: { approved_by: profile.display_name } }
        );
      }
      await checkUserAuth();
      toast({ title: "Profile updated!" });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters", variant: "destructive" });
      return;
    }
    if (!passwords.currentPassword) {
      toast({ title: "Enter your current password", variant: "destructive" });
      return;
    }
    setSendingCode(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 10 * 60 * 1000;
      await base44.auth.updateMe({ pw_reset_code: code, pw_reset_expires: String(expires) });
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Your GardenGuard verification code",
        body: `<div style="font-family:Inter,sans-serif;max-width:420px;margin:auto;background:#0a0a0a;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid #1a1a1a">
          <h2 style="color:#22ff88;margin:0 0 16px">GardenGuard</h2>
          <p style="margin:0 0 8px;color:#888">You requested a password change.</p>
          <p style="margin:0 0 20px;color:#888">Use this code to confirm the change:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;background:#111;padding:20px;border-radius:12px;color:#22ff88">${code}</div>
          <p style="margin:20px 0 0;color:#555;font-size:13px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>`,
      });
      toast({ title: "Verification code sent!", description: `Check your email at ${user.email}` });
      setPwStep("verify");
    } catch (e) {
      toast({ title: "Failed to send code", description: e.message, variant: "destructive" });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyAndChange = async () => {
    if (pwCode.length < 6) {
      toast({ title: "Enter the 6-digit code", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      const fresh = await base44.auth.me();
      const storedCode = fresh.pw_reset_code;
      const expiresStr = fresh.pw_reset_expires;
      if (!storedCode || storedCode !== pwCode) {
        toast({ title: "Invalid code", description: "The code doesn't match", variant: "destructive" });
        setPwLoading(false);
        return;
      }
      if (expiresStr && Date.now() > Number(expiresStr)) {
        toast({ title: "Code expired", description: "Request a new code", variant: "destructive" });
        setPwLoading(false);
        return;
      }
      await base44.auth.changePassword({
        userId: user.id,
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      await base44.auth.updateMe({ pw_reset_code: "", pw_reset_expires: "" });
      toast({ title: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwCode("");
      setPwStep("form");
    } catch (e) {
      toast({ title: "Failed to change password", description: e.message, variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  const handleResendCode = async () => {
    setSendingCode(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 10 * 60 * 1000;
      await base44.auth.updateMe({ pw_reset_code: code, pw_reset_expires: String(expires) });
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Your GardenGuard verification code",
        body: `<div style="font-family:Inter,sans-serif;max-width:420px;margin:auto;background:#0a0a0a;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid #1a1a1a">
          <h2 style="color:#22ff88;margin:0 0 16px">GardenGuard</h2>
          <p style="margin:0 0 8px;color:#888">You requested a password change.</p>
          <p style="margin:0 0 20px;color:#888">Use this code to confirm the change:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;background:#111;padding:20px;border-radius:12px;color:#22ff88">${code}</div>
          <p style="margin:20px 0 0;color:#555;font-size:13px">This code expires in 10 minutes.</p>
        </div>`,
      });
      toast({ title: "New code sent!" });
    } catch (e) {
      toast({ title: "Failed to resend", description: e.message, variant: "destructive" });
    } finally {
      setSendingCode(false);
    }
  };

  const displayName = profile.display_name || user?.full_name || "Player";

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <UserIcon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            <h1 className="font-display text-xl sm:text-4xl font-bold">Profile Settings</h1>
          </div>
          <p className="text-xs sm:text-base text-muted-foreground">Customize your account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-3 sm:p-6 mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4"
        >
          <div className="relative shrink-0">
            {profile.pfp_url ? (
              <img
                src={profile.pfp_url}
                alt="Profile"
                className="w-12 h-12 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                <UserIcon className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
              {uploadingPfp ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Camera className="w-3 h-3 sm:w-4 sm:h-4" />}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && handlePfpUpload(e.target.files[0])}
              />
            </label>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-xl font-bold truncate">{displayName}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
            {user?.role === "admin" && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] sm:text-xs bg-secondary/10 text-secondary border border-secondary/30">
                Admin
              </span>
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Key className="w-4 h-4" /> Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="Your display name"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="your_username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">This is your public handle</p>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="password">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              {pwStep === "form" ? (
                <>
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <Button
                    onClick={handleSendCode}
                    disabled={
                      sendingCode ||
                      !passwords.currentPassword ||
                      !passwords.newPassword ||
                      !passwords.confirmPassword
                    }
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {sendingCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Send Verification Code
                  </Button>
                </>
              ) : (
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-primary">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1">Check your email</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    We sent a 6-digit code to {user?.email}
                  </p>
                  <div className="flex justify-center mb-6">
                    <InputOTP
                      maxLength={6}
                      value={pwCode}
                      onChange={setPwCode}
                      autoFocus
                      autoComplete="one-time-code"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    onClick={handleVerifyAndChange}
                    disabled={pwLoading || pwCode.length < 6}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                  >
                    {pwLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Verify & Change Password
                  </Button>
                  <div className="flex justify-between mt-4 text-sm">
                    <button
                      onClick={() => setPwStep("form")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleResendCode}
                      disabled={sendingCode}
                      className="text-primary hover:underline"
                    >
                      {sendingCode ? "Sending..." : "Resend code"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}