// src/pages/Settings.tsx
import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Lock,
  Shield,
  Trash2,
  Save,
  Mail,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
// @ts-ignore
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

export function Settings() {
  const navigate = useNavigate();
  const { user, token, updateProfile, logout, changePassword } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  // fallback token from localStorage
  const storedToken = localStorage.getItem("token");
  const authToken = token || storedToken;

  // Form states
  const [email, setEmail] = useState(user?.email || storedUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [requestNotifications, setRequestNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);

  // Keep settings email synced with logged-in user data
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else if (storedUser?.email) {
      setEmail(storedUser.email);
    }
  }, [user?.email, storedUser?.email]);

  // ─── Account Update ─────────────────────────────────────
  const handleSaveAccount = async () => {
    if (!authToken) return toast.error("Not logged in.");
    try {
      await updateProfile({ email });
      toast.success("Account settings saved successfully!");
    } catch {
      toast.error("Failed to save account settings.");
    }
  };
  const handleChangePassword = async () => {
    console.log("Function started");

    alert("Function started");

    if (!currentPassword || !newPassword) {
      alert("Fields missing");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);

      alert("Password changed successfully");

      navigate("/login");

    } catch (err) {
      console.log("ERROR:", err);
      alert("Error happened");
    }
  };

  // ─── Notifications ─────────────────────────────────────
  const handleSaveNotifications = async () => {
    if (!authToken) return toast.error("Not logged in.");
    try {
      await axios.put(
        "/api/notifications",
        { emailNotifications, requestNotifications, messageNotifications },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success("Notification preferences updated!");
    } catch {
      toast.error("Failed to update notifications.");
    }
  };

  // ─── Privacy ──────────────────────────────────────────
  const handleSavePrivacy = async () => {
    if (!authToken) return toast.error("Not logged in.");
    try {
      await axios.put(
        "/api/privacy",
        { profileVisibility, showEmail },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success("Privacy settings updated!");
    } catch {
      toast.error("Failed to update privacy settings.");
    }
  };

  // ─── Delete Account ───────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!authToken) return toast.error("Not logged in.");
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/delete-account`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      toast.success("Account deleted successfully!");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      logout();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Failed to delete account.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto my-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#052659] mb-2">Settings</h1>
        <p className="text-[#64748B]">Manage your account preferences and settings</p>
      </div>

      {/* Account Settings */}
      <Card className="p-6 bg-white border-[#E2E8F0] shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#5483B3]/10 rounded-lg">
            <User className="w-5 h-5 text-[#5483B3]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#052659]">Account Settings</h2>
            <p className="text-sm text-[#64748B]">Update your account information</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-[#052659] flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 border-[#E2E8F0]"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveAccount}
              className="bg-[#5483B3] hover:bg-[#052659] text-white"
            >
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6 bg-white border-[#E2E8F0] shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#5483B3]/10 rounded-lg">
            <Lock className="w-5 h-5 text-[#5483B3]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#052659]">Change Password</h2>
            <p className="text-sm text-[#64748B]">Update your password regularly for security</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-6 py-2 rounded-xl font-medium text-white
               bg-[#5483B3]
               hover:bg-[#3e6f9e]
               transition-all duration-300
               transform hover:scale-[1.02] active:scale-[0.98]
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C1E8FF]"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 bg-white border-[#E2E8F0] shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#5483B3]/10 rounded-lg">
            <Bell className="w-5 h-5 text-[#5483B3]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#052659]">Notifications</h2>
            <p className="text-sm text-[#64748B]">Configure how you receive notifications</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#C1E8FF]/10">
            <p>Email Notifications</p>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#C1E8FF]/10">
            <p>Team Requests</p>
            <Switch checked={requestNotifications} onCheckedChange={setRequestNotifications} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#C1E8FF]/10">
            <p>Messages</p>
            <Switch checked={messageNotifications} onCheckedChange={setMessageNotifications} />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveNotifications}
              className="bg-[#5483B3] hover:bg-[#052659] text-white"
            >
              <Save className="w-4 h-4 mr-2" /> Save Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6 bg-white border-[#E2E8F0] shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#5483B3]/10 rounded-lg">
            <Shield className="w-5 h-5 text-[#5483B3]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#052659]">Privacy</h2>
            <p className="text-sm text-[#64748B]">Control your profile visibility</p>
          </div>
        </div>
        <div className="space-y-4">
          <Label className="text-[#052659] flex items-center gap-2">
            <Eye className="w-4 h-4" /> Profile Visibility
          </Label>
          <Select value={profileVisibility} onValueChange={setProfileVisibility}>
            <SelectTrigger className="mt-1 border-[#E2E8F0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can see</SelectItem>
              <SelectItem value="members">Members Only</SelectItem>
              <SelectItem value="private">Private - Hidden from search</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#C1E8FF]/10">
            <p>Show Email on Profile</p>
            <Switch checked={showEmail} onCheckedChange={setShowEmail} />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSavePrivacy}
              className="bg-[#5483B3] hover:bg-[#052659] text-white"
            >
              <Save className="w-4 h-4 mr-2" /> Save Privacy Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-white border-red-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
            <p className="text-sm text-[#64748B]">Irreversible and destructive actions</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h3 className="font-semibold text-red-600 mb-2">Delete Account</h3>
          <p className="text-sm text-[#475569] mb-4">
            Once you delete your account, there is no going back. All your data, including profile, skills, and history will be permanently deleted.
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete My Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
