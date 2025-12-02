// frontend/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Bell,
  Palette,
  Lock,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  X,
  Edit,
  Camera,
  Settings,
  Activity,
  Award,
  Clock,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword, uploadAvatar, deleteAvatar } = useAuth();
  const { currentTheme, changeTheme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    organization: '',
    jobTitle: '',
    website: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    weeklyDigest: false,
    marketingEmails: false,
    soundEnabled: true,
    autoSave: true,
    darkMode: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        organization: user.organization || '',
        jobTitle: user.jobTitle || '',
        website: user.website || '',
      });

      setSettings(prev => ({
        ...prev,
        ...user.settings,
        darkMode: currentTheme === 'dark',
      }));
    }
  }, [user, currentTheme]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'darkMode') {
      changeTheme(value ? 'dark' : 'light');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      await uploadAvatar(avatarFile, setUploadProgress);
      setAvatarFile(null);
      setAvatarPreview(null);
      setUploadProgress(0);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatar();
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Avatar removed successfully');
    } catch (error) {
      console.error('Avatar deletion failed:', error);
      toast.error('Failed to remove avatar');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });

      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error('Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  const userStats = {
    projectsCreated: 12,
    tasksCompleted: 87,
    collaborators: 24,
    hoursWorked: 156,
    documentsCreated: 34,
    ideasGenerated: 45,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Profile" user={user} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Avatar */}
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User Avatar"
                      className="h-16 w-16 rounded-full border-2 border-white object-cover shadow"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-gray-600 shadow">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
