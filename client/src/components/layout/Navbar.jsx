import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, Menu, X, LogOut, User, Settings,
  GraduationCap, Users, Briefcase, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import useSocketStore from '../../store/socketStore';
import authService from '../../api/authService';
import notificationService from '../../api/notificationService';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const navLinks = {
  student: [
    { label: 'Dashboard',  href: '/student/dashboard', icon: GraduationCap },
    { label: 'Mentors',    href: '/mentors',            icon: Users },
    { label: 'Events',     href: '/events',             icon: Calendar },
    { label: 'Jobs',       href: '/jobs',               icon: Briefcase },
  ],
  alumni: [
    { label: 'Dashboard',  href: '/alumni/dashboard',   icon: GraduationCap },
    { label: 'Mentors',    href: '/mentors',            icon: Users },
    { label: 'Events',     href: '/events',             icon: Calendar },
    { label: 'Jobs',       href: '/jobs',               icon: Briefcase },
  ],
  mentor: [
    { label: 'Dashboard',  href: '/mentor/dashboard',   icon: GraduationCap },
    { label: 'Requests',   href: '/connections',        icon: Users },
    { label: 'Events',     href: '/events',             icon: Calendar },
    { label: 'Jobs',       href: '/jobs',               icon: Briefcase },
  ],
  admin: [
    { label: 'Dashboard',  href: '/admin/dashboard',    icon: GraduationCap },
    { label: 'Users',      href: '/admin/users',        icon: Users },
    { label: 'Jobs',       href: '/admin/jobs',         icon: Briefcase },
    { label: 'Events',     href: '/admin/events',       icon: Calendar },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount, setUnreadCount, incrementUnread } = useNotificationStore();
  const { socket } = useSocketStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const links = navLinks[user?.role] || [];

  // Load initial unread count
  useEffect(() => {
    if (!user) return;
    notificationService.getUnreadCount()
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [user, setUnreadCount]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', () => {
      incrementUnread();
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket, incrementUnread]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // proceed even if API fails
    }
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">
              Mentor Connect
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isActive(link.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <Badge variant={user?.role} size="xs" className="mt-0.5">
                    {user?.role}
                  </Badge>
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  ${isActive(link.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;