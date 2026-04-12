import { ref, readonly } from 'vue';

interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);
let notificationId = 0;

export const useNotifications = () => {
  const show = (type: 'success' | 'error' | 'info', title: string, message: string, duration = 4000) => {
    const id = ++notificationId;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    notifications.value.push(notification);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  const remove = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const success = (title: string, message: string, duration?: number) =>
    show('success', title, message, duration);

  const error = (title: string, message: string, duration?: number) =>
    show('error', title, message, duration);

  const info = (title: string, message: string, duration?: number) =>
    show('info', title, message, duration);

  // Alert replacement function
  const alert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'error') {
      error('Error', message);
    } else if (type === 'success') {
      success('Success', message);
    } else {
      info('Notice', message);
    }
  };

  return {
    notifications: readonly(notifications),
    show,
    success,
    error,
    info,
    alert,
    remove
  };
};