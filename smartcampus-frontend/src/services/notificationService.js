const API_BASE_URL = 'http://localhost:8081/api/notifications';

export const notificationService = {
  // Get current user's notifications
  async getMyNotifications() {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch notifications: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  // Get unread notification count
  async getUnreadCount() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/unread-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Unread count response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unread count error:', errorText);
        throw new Error(`Failed to fetch unread count: ${response.status}`);
      }

      const data = await response.json();
      console.log('Unread count data:', data);
      return data;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await fetch(`${API_BASE_URL}/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark all as read');
      }

      return true;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete notification');
      }

      return true;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }
};
