import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  notifications: [],

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: (by = 1) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - by),
    })),

  resetUnread: () => set({ unreadCount: 0 }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  setNotifications: (notifications) => set({ notifications }),
}));

export default useNotificationStore;