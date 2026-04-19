const API_BASE_URL = 'http://localhost:8081/api/users';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'X-User-Email': JSON.parse(localStorage.getItem('user'))?.email || 'admin@demo.com'
});

export const userService = {
  // Fetch all users
  async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(role),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
