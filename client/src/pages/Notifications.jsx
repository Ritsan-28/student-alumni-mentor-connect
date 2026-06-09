import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { PageLoader } from '../components/common/Loader';
import notificationService from '../api/notificationService';
import useNotificationStore from '../store/notificationStore';

const typeIcons = {
  connection_request:  '🤝',
  connection_accepted: '✅',
  new_message:         '💬',
  new_event:           '📅',
  new_job:             '💼',
  general:             '🔔',
};

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!notification.isRead) {
      await onRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer
        ${notification.isRead
          ? 'bg-white border-gray-100 hover:bg-gray-50'
          : 'bg-primary-50 border-primary-100 hover:bg-primary-100'
        }
      `}
      onClick={handleClick}
    >
      {/* Icon or Avatar */}
      <div className="shrink-0">
        {notification.sender ? (
          <Avatar
            src={notification.sender.avatar}
            name={notification.sender.name}
            size="md"
          />
        ) : (
          <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-xl">
            {typeIcons[notification.type] || '🔔'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-primary-900'}`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-1.5" />
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(notification.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.isRead && (
          <button
            onClick={() => onRead(notification._id)}
            className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-primary-600 transition-colors"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setUnreadCount, resetUnread } = useNotificationStore();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await notificationService.getNotifications();
        if (!cancelled) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unreadCount);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load notifications');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [setUnreadCount]);

  const handleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(
        notifications.filter((n) => !n.isRead && n._id !== id).length
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount(Math.max(0,
          notifications.filter((n) => !n.isRead).length - 1
        ));
      }
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      resetUnread();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  if (isLoading) return <PageLoader />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You'll be notified about connection requests, messages, and more"
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Notifications;