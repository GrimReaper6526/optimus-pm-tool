import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, 
  Lock, 
  Camera, 
  Sparkles, 
  Link2, 
  ChevronLeft, 
  Save, 
  Loader2, 
  Mail,
  RefreshCw,
  Settings
} from 'lucide-react';

const DICEBEAR_STYLES = [
  { value: 'initials', label: 'Initials' },
  { value: 'adventurer', label: 'Adventurer' },
  { value: 'bottts', label: 'Robots' },
  { value: 'fun-emoji', label: 'Emojis' },
  { value: 'avataaars', label: 'Avatars' },
  { value: 'lorelei', label: 'Lorelei' },
  { value: 'pixel-art', label: 'Pixel Art' }
];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  // Tab State: 'details' | 'avatar' | 'security'
  const [activeTab, setActiveTab] = useState('details');

  // Loaders
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  // Avatar states
  const [avatarSource, setAvatarSource] = useState('dicebear'); // 'dicebear' | 'custom'
  const [avatarStyle, setAvatarStyle] = useState('initials');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Populate initial values
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setEmail(user.email || '');
      
      // Parse current avatar to determine source
      if (user.avatar) {
        if (user.avatar.includes('api.dicebear.com')) {
          setAvatarSource('dicebear');
          setAvatarPreview(user.avatar);
          
          // Try to extract style and seed
          try {
            const url = new URL(user.avatar);
            const pathParts = url.pathname.split('/');
            // path is typically /7.x/{style}/svg
            const styleIndex = pathParts.indexOf('7.x') + 1;
            if (styleIndex > 0 && styleIndex < pathParts.length) {
              const style = pathParts[styleIndex];
              if (DICEBEAR_STYLES.some(s => s.value === style)) {
                setAvatarStyle(style);
              }
            }
            const seedParam = url.searchParams.get('seed');
            if (seedParam) {
              setAvatarSeed(decodeURIComponent(seedParam));
            } else {
              setAvatarSeed(user.username || '');
            }
          } catch (e) {
            // fallback
            setAvatarStyle('initials');
            setAvatarSeed(user.username || '');
          }
        } else {
          setAvatarSource('custom');
          setCustomAvatarUrl(user.avatar);
          setAvatarPreview(user.avatar);
        }
      } else {
        setAvatarSource('dicebear');
        setAvatarStyle('initials');
        setAvatarSeed(user.username || '');
        setAvatarPreview(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username || '')}`);
      }
    }
  }, [user]);

  // Live avatar preview generation
  useEffect(() => {
    if (avatarSource === 'dicebear') {
      const seed = avatarSeed.trim() || username || 'default';
      const url = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(seed)}`;
      setAvatarPreview(url);
    } else {
      setAvatarPreview(customAvatarUrl.trim());
    }
  }, [avatarSource, avatarStyle, avatarSeed, customAvatarUrl, username]);

  const handleGenerateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setAvatarSeed(randomSeed);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      return toast.error('Username cannot be empty');
    }
    if (username.length < 3) {
      return toast.error('Username must be at least 3 characters');
    }

    setIsSavingDetails(true);
    try {
      const { data } = await api.put('/auth/profile', {
        username: username.trim(),
        bio: bio.trim()
      });
      updateUser(data.user);
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile details');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSaveAvatar = async (e) => {
    e.preventDefault();
    
    let targetAvatarUrl = avatarPreview;
    if (avatarSource === 'custom' && !customAvatarUrl.trim()) {
      return toast.error('Please enter a custom avatar URL');
    }

    setIsSavingAvatar(true);
    try {
      const { data } = await api.put('/auth/profile', {
        avatar: targetAvatarUrl
      });
      updateUser(data.user);
      toast.success('Avatar updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update avatar');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      return toast.error('Current password is required');
    }
    if (!newPassword) {
      return toast.error('New password is required');
    }
    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters long');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSavingSecurity(true);
    try {
      await api.put('/auth/profile', {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-page">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-page py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Settings size={20} className="text-accent-primary" />
            Profile Settings
          </h1>
        </div>

        {/* Main Layout Card with Glassmorphic Style */}
        <Card className="bg-surface-raised/60 backdrop-blur-md border border-border-default overflow-hidden p-0 shadow-lg xl:rounded-xl">
          <div className="flex flex-col md:flex-row min-h-[500px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border-default bg-subtle/30 p-4 space-y-1">
              <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-border-default">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-10 h-10 rounded-full border border-border-default bg-muted object-cover"
                />
                <div className="overflow-hidden">
                  <h2 className="text-sm font-semibold text-text-primary truncate">{user.username}</h2>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('details')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-subtle/50'
                }`}
              >
                <User size={16} />
                Profile Details
              </button>

              <button
                onClick={() => setActiveTab('avatar')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'avatar'
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-subtle/50'
                }`}
              >
                <Camera size={16} />
                Avatar Designer
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'security'
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-subtle/50'
                }`}
              >
                <Lock size={16} />
                Security & Password
              </button>
            </div>

            {/* Tab Contents Area */}
            <div className="flex-1 p-6 sm:p-8 bg-surface-raised/10">
              {/* DETAILS TAB */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">Profile Details</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Update your account username and public biography.
                    </p>
                  </div>

                  <form onSubmit={handleSaveDetails} className="space-y-5">
                    <Input
                      label="Email Address"
                      type="email"
                      id="email"
                      value={email}
                      disabled
                      hint="Email cannot be changed as it is connected to your login credentials."
                      className="bg-muted opacity-80 cursor-not-allowed"
                    />

                    <Input
                      label="Username"
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="e.g. janesmith"
                      hint="Alphanumeric characters and underscores only."
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="bio" className="text-sm font-medium text-text-primary">
                        Biography / About Me
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell others about yourself..."
                        rows={4}
                        maxLength={200}
                        className="w-full px-3 py-2 text-sm text-text-primary bg-page border border-border-default rounded-md shadow-sm placeholder:text-text-tertiary hover:border-border-strong focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-primary/20 transition-colors duration-150 resize-none"
                      />
                      <p className="text-xs text-text-secondary text-right">
                        {bio.length}/200 characters
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border-default flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSavingDetails}
                        className="w-full sm:w-auto"
                      >
                        {isSavingDetails ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving Details...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save Details
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* AVATAR DESIGNER TAB */}
              {activeTab === 'avatar' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">Avatar Designer</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Customize a beautiful vector avatar using the Dicebear generator, or enter a custom link.
                    </p>
                  </div>

                  <form onSubmit={handleSaveAvatar} className="space-y-6">
                    {/* Live Avatar Preview Container */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border-default bg-subtle/20">
                      <div className="relative group flex-shrink-0 w-24 h-24 rounded-full border border-border-strong overflow-hidden bg-muted flex items-center justify-center">
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt="Avatar Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username || 'default')}`;
                              toast.error('Invalid image URL, falling back to initials');
                            }}
                          />
                        ) : (
                          <User size={40} className="text-text-tertiary" />
                        )}
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-accent-subtle text-accent-text">
                          Live Preview
                        </span>
                        <h4 className="text-sm font-medium text-text-primary">Your Dynamic Avatar</h4>
                        <p className="text-xs text-text-secondary max-w-sm">
                          Avatars update in real-time in the sidebar and navigation once applied.
                        </p>
                      </div>
                    </div>

                    {/* Source Selector */}
                    <div className="flex gap-4 border-b border-border-default pb-3">
                      <button
                        type="button"
                        onClick={() => setAvatarSource('dicebear')}
                        className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all border-b-2 ${
                          avatarSource === 'dicebear'
                            ? 'border-accent-primary text-accent-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Sparkles size={16} />
                        Dicebear Generator
                      </button>

                      <button
                        type="button"
                        onClick={() => setAvatarSource('custom')}
                        className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all border-b-2 ${
                          avatarSource === 'custom'
                            ? 'border-accent-primary text-accent-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Link2 size={16} />
                        Custom Image URL
                      </button>
                    </div>

                    {/* Dicebear Settings Form */}
                    {avatarSource === 'dicebear' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="avatar-style" className="text-sm font-medium text-text-primary">
                              Avatar Style
                            </label>
                            <select
                              id="avatar-style"
                              value={avatarStyle}
                              onChange={(e) => setAvatarStyle(e.target.value)}
                              className="w-full px-3 py-2 text-sm text-text-primary bg-page border border-border-default rounded-md shadow-sm hover:border-border-strong focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-primary/20 transition-colors duration-150"
                            >
                              {DICEBEAR_STYLES.map((style) => (
                                <option key={style.value} value={style.value}>
                                  {style.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="avatar-seed" className="text-sm font-medium text-text-primary">
                              Generator Seed / Name
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="avatar-seed"
                                value={avatarSeed}
                                onChange={(e) => setAvatarSeed(e.target.value)}
                                placeholder="Type anything to randomize..."
                                className="w-full pr-10 px-3 py-2 text-sm text-text-primary bg-page border border-border-default rounded-md shadow-sm hover:border-border-strong focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-primary/20 transition-colors duration-150"
                              />
                              <button
                                type="button"
                                onClick={handleGenerateRandomSeed}
                                title="Randomize Seed"
                                className="absolute right-2 top-2 p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors"
                              >
                                <RefreshCw size={14} className="animate-hover" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom URL Input Form */}
                    {avatarSource === 'custom' && (
                      <div className="space-y-4">
                        <Input
                          label="Custom Image URL"
                          type="url"
                          id="custom-avatar-url"
                          value={customAvatarUrl}
                          onChange={(e) => setCustomAvatarUrl(e.target.value)}
                          placeholder="https://example.com/my-photo.jpg"
                          hint="Paste a direct URL link to an image file (PNG, JPG, SVG, WebP)."
                        />
                      </div>
                    )}

                    <div className="pt-4 border-t border-border-default flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSavingAvatar}
                        className="w-full sm:w-auto"
                      >
                        {isSavingAvatar ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Applying Avatar...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Apply Avatar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECURITY & PASSWORD TAB */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">Security & Password</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Keep your account safe by updating your password.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSecurity} className="space-y-5">
                    <Input
                      label="Current Password"
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />

                    <Input
                      label="New Password"
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      hint="Password must be at least 8 characters long."
                      required
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />

                    <div className="pt-4 border-t border-border-default flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSavingSecurity}
                        className="w-full sm:w-auto"
                      >
                        {isSavingSecurity ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Updating Password...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
