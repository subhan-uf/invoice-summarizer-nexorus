"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { title, subtitle } from "@/components/primitives";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  BellIcon,
  TrashIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    marketing: true,
    updates: true,
    security: true
  });

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Add state for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfileError("Not authenticated");
        setProfileLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, avatar_url, company, created_at")
        .eq("id", user.id)
        .single();
      if (error) {
        setProfileError(error.message);
      } else {
        // Use email from auth user, not from profiles table
        setProfile({ ...data, email: user.email || '' });
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, []);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setSaveSuccess("");
    setProfileError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfileError("Not authenticated");
      toast.error("Please log in to save your profile");
      setSaveLoading(false);
      return;
    }
    // Update email in Supabase Auth if changed
    if (profile.email && profile.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: profile.email });
      if (emailError) {
        setProfileError(emailError.message);
        toast.error(emailError.message);
        setSaveLoading(false);
        return;
      }
    }
    // Update profile in DB (email is managed by auth, not profiles table)
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      avatar_url: profile.avatar_url,
    });
    setSaveLoading(false);
    if (error) {
      setProfileError(error.message);
      toast.error(error.message);
    } else {
      setSaveSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    }
  };

  // Avatar upload
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setAvatarUploading(true);
    setAvatarError("");
    const file = e.target.files[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAvatarError("Not authenticated");
      setAvatarUploading(false);
      return;
    }
    const filePath = `${user.id}/avatar_${Date.now()}`;
    const { error: storageError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (storageError) {
      setAvatarError(storageError.message);
      setAvatarUploading(false);
      return;
    }
    const avatarUrl = supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;
    setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
    setAvatarUploading(false);
  };

  // Avatar remove
  const handleAvatarRemove = async () => {
    setProfile((prev: any) => ({ ...prev, avatar_url: null }));
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    setSaveLoading(true);
    setSaveSuccess("");
    setProfileError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfileError("Not authenticated");
      setSaveLoading(false);
      return;
    }
    const { error } = await supabase.from("user_settings").upsert({
      id: user.id,
      email_notifications: notifications.email,
      sms_notifications: notifications.sms,
      marketing_emails: notifications.marketing,
      updates: notifications.updates,
      security_alerts: notifications.security,
    });
    setSaveLoading(false);
    if (error) {
      setProfileError(error.message);
    } else {
      setSaveSuccess("Notification preferences updated!");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteError("You must type 'DELETE' to confirm.");
      toast.error("You must type 'DELETE' to confirm.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setDeleteError('Please log in to delete your account');
        toast.error('Please log in to delete your account');
        setDeleteLoading(false);
        return;
      }
      
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setDeleteLoading(false);
        toast.success('Account deleted successfully');
        // Redirect to goodbye page
        window.location.href = "/goodbye";
      } else {
        setDeleteError(result.error || 'Failed to delete account');
        toast.error(result.error || 'Failed to delete account');
        setDeleteLoading(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account. Please try again.');
      toast.error('Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      toast.error("All password fields are required.");
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      toast.error("New passwords do not match.");
      setPasswordLoading(false);
      return;
    }
    // Re-authenticate user by signing in with current password
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
      setPasswordError("Not authenticated");
      toast.error("Please log in to change your password");
      setPasswordLoading(false);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email || '', password: currentPassword });
    if (signInError) {
      setPasswordError("Current password is incorrect.");
      toast.error("Current password is incorrect.");
      setPasswordLoading(false);
      return;
    }
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setPasswordError(updateError.message);
      toast.error(updateError.message);
      setPasswordLoading(false);
      return;
    }
    setPasswordSuccess("Password changed successfully!");
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={title({ size: "lg" })}>Settings</h1>
            <p className={subtitle({ class: "mt-2" })}>
              Manage your account preferences and security settings
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="bordered"
              color="primary"
              startContent={<ShieldCheckIcon className="w-4 h-4" />}
            >
              Security Log
            </Button>
            <Button
              color="primary"
              startContent={<CogIcon className="w-4 h-4" />}
              onPress={handleSaveProfile}
              isLoading={saveLoading}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                {profileLoading ? (
                  <div className="py-8 text-center">Loading profile...</div>
                ) : profileError ? (
                  <div className="py-8 text-danger text-center">{profileError}</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar
                        src={profile.avatar_url || "https://i.pravatar.cc/150?u=1"}
                        name={profile.first_name + " " + profile.last_name}
                        size="lg"
                        className="w-20 h-20"
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="bordered"
                          color="primary"
                          startContent={<CameraIcon className="w-4 h-4" />}
                          size="sm"
                          isLoading={avatarUploading}
                          as="label"
                        >
                          Change Photo
                          <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={avatarUploading} />
                        </Button>
                        <Button
                          variant="light"
                          color="danger"
                          size="sm"
                          onPress={handleAvatarRemove}
                          disabled={avatarUploading}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        placeholder="John"
                        variant="bordered"
                        value={profile.first_name || ""}
                        startContent={<UserIcon className="w-4 h-4 text-default-400" />}
                        onChange={e => handleProfileChange("first_name", e.target.value)}
                      />
                      <Input
                        label="Last Name"
                        placeholder="Doe"
                        variant="bordered"
                        value={profile.last_name || ""}
                        startContent={<UserIcon className="w-4 h-4 text-default-400" />}
                        onChange={e => handleProfileChange("last_name", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        placeholder="john@example.com"
                        variant="bordered"
                        value={profile.email || ""}
                        startContent={<EnvelopeIcon className="w-4 h-4 text-default-400" />}
                        onChange={e => handleProfileChange("email", e.target.value)}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        variant="bordered"
                        value={profile.phone || ""}
                        startContent={<PhoneIcon className="w-4 h-4 text-default-400" />}
                        onChange={e => handleProfileChange("phone", e.target.value)}
                      />
                    </div>
                    {avatarError && <div className="text-danger text-sm">{avatarError}</div>}
                    {saveSuccess && <div className="text-success text-sm">{saveSuccess}</div>}
                    {profileError && <div className="text-danger text-sm">{profileError}</div>}
                    <Button
                      color="primary"
                      startContent={<CogIcon className="w-4 h-4" />}
                      onPress={handleSaveProfile}
                      isLoading={saveLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Company Information */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 rounded-full p-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold">Company Information</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-secondary/20 rounded-lg p-4 w-16 h-16 flex items-center justify-center">
                      <BuildingOfficeIcon className="w-8 h-8 text-secondary" />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="bordered"
                        color="secondary"
                        startContent={<CameraIcon className="w-4 h-4" />}
                        size="sm"
                      >
                        Upload Logo
                      </Button>
                      <Button
                        variant="light"
                        color="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Company Name"
                      placeholder="Your Company Name"
                      variant="bordered"
                      defaultValue="AI Invoice Summarizer"
                      startContent={<BuildingOfficeIcon className="w-4 h-4 text-default-400" />}
                    />
                    <Input
                      label="Website"
                      placeholder="https://example.com"
                      variant="bordered"
                      defaultValue="https://invoice-summarizer.com"
                      startContent={<GlobeAltIcon className="w-4 h-4 text-default-400" />}
                    />
                  </div>
                  
                  <textarea
                    className="border rounded-lg p-2 w-full min-h-[80px]"
                    placeholder="Brief description of your company"
                    value={profile?.tagline || ""}
                    onChange={e => handleProfileChange("tagline", e.target.value)}
                  />
                  
                  <Input
                    label="Address"
                    placeholder="Enter your business address"
                    variant="bordered"
                    defaultValue="123 Business St, City, State 12345"
                    startContent={<MapPinIcon className="w-4 h-4 text-default-400" />}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Password & Security */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-warning/10 rounded-full p-2">
                    <KeyIcon className="w-5 h-5 text-warning" />
                  </div>
                  <h3 className="text-lg font-semibold">Password & Security</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="Enter current password"
                      variant="bordered"
                      startContent={<KeyIcon className="w-4 h-4 text-default-400" />}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      variant="bordered"
                      startContent={<KeyIcon className="w-4 h-4 text-default-400" />}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                    variant="bordered"
                    startContent={<KeyIcon className="w-4 h-4 text-default-400" />}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  {passwordError && <div className="text-danger text-sm">{passwordError}</div>}
                  {passwordSuccess && <div className="text-success text-sm">{passwordSuccess}</div>}
                  <Button
                    color="primary"
                    onPress={handleChangePassword}
                    isLoading={passwordLoading}
                  >
                    Change Password
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notification Preferences */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-success/10 rounded-full p-2">
                    <BellIcon className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold">Notifications</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-default-600">Receive updates via email</p>
                    </div>
                    <Switch
                      isSelected={notifications.email}
                      onValueChange={(value) => handleNotificationChange('email', value)}
                      color="success"
                    />
                  </div>
                  
                  <Divider />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-default-600">Receive updates via SMS</p>
                    </div>
                    <Switch
                      isSelected={notifications.sms}
                      onValueChange={(value) => handleNotificationChange('sms', value)}
                      color="success"
                    />
                  </div>
                  
                  <Divider />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-default-600">Receive promotional content</p>
                    </div>
                    <Switch
                      isSelected={notifications.marketing}
                      onValueChange={(value) => handleNotificationChange('marketing', value)}
                      color="success"
                    />
                  </div>
                  
                  <Divider />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-sm text-default-600">New features and improvements</p>
                    </div>
                    <Switch
                      isSelected={notifications.updates}
                      onValueChange={(value) => handleNotificationChange('updates', value)}
                      color="success"
                    />
                  </div>
                  
                  <Divider />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-default-600">Account security notifications</p>
                    </div>
                    <Switch
                      isSelected={notifications.security}
                      onValueChange={(value) => handleNotificationChange('security', value)}
                      color="success"
                    />
                  </div>
                </div>
                <Button
                  color="primary"
                  onPress={handleSaveNotifications}
                  isLoading={saveLoading}
                >
                  Save Notification Preferences
                </Button>
                {saveSuccess && <div className="text-success text-sm mt-2">{saveSuccess}</div>}
                {profileError && <div className="text-danger text-sm mt-2">{profileError}</div>}
              </CardBody>
            </Card>

            {/* Account Status */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold">Account Status</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">Email Verified</p>
                      <p className="text-sm text-default-600">john@example.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">2FA Enabled</p>
                      <p className="text-sm text-default-600">Authenticator app</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium">Password Expires</p>
                      <p className="text-sm text-default-600">In 15 days</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-danger/5 border-1 border-danger/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-danger/10 rounded-full p-2">
                    <TrashIcon className="w-5 h-5 text-danger" />
                  </div>
                  <h3 className="text-lg font-semibold text-danger">Danger Zone</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <p className="text-sm text-default-600">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Input
                    variant="bordered"
                    color="danger"
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                  />
                  {deleteError && <div className="text-danger text-sm">{deleteError}</div>}
                  <Button color="danger" onPress={handleDeleteAccount} isLoading={deleteLoading}>
                    Delete Account
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Delete Account Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <TrashIcon className="w-6 h-6 text-danger" />
                Delete Account
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="bg-danger/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
                    <span className="font-semibold text-danger">Warning</span>
                  </div>
                  <p className="text-sm text-default-600">
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </p>
                </div>
                
                <Input
                  label="Type 'DELETE' to confirm"
                  placeholder="DELETE"
                  variant="bordered"
                  color="danger"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="danger" onPress={onClose}>
                Delete Account
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
} 