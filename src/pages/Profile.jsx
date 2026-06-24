import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { uploadFile } from "@/lib/uploadFile";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User as UserIcon, Key, Save, Camera } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Profile() {
  const { user, checkUserAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [profile, setProfile] = useState({
    display_name: "",
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
        pfp_url: user.pfp_url || "",
      });
    }
  }, [user]);

  const handlePfpUpload = async (file) => {
    setUploadingPfp(true);
    try {
      const url = await uploadFile(file);
      setProfile((prev) => ({ ...prev, pfp_url: url }));
      const { error } = await supabase.from("profiles").update({ pfp_url: url }).eq("id", user.id);
      if (error) throw error;
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
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: profile.display_name })
        .eq("id", user.id);
      if (error) throw error;

      if (profile.display_name !== oldName) {
        await supabase
          .from("scammer_reports")
          .update({ approved_by: profile.display_name })
          .eq("approved_by_id", user.id);
      }
      await checkUserAuth();
      toast({ title: "Profile updated!" });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
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
    setPwLoading(true);
    try {
      // Verify the current password by re-authenticating
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.currentPassword,
      });
      if (verifyError) {
        toast({ title: "Current password is incorrect", variant: "destructive" });
        setPwLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
      if (error) throw error;

      toast({ title: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast({ title: "Failed to change password", description: e.message, variant: "destructive" });
    } finally {
      setPwLoading(false);
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
                onClick={handleChangePassword}
                disabled={
                  pwLoading ||
                  !passwords.currentPassword ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword
                }
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Change Password
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
