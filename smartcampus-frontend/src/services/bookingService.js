const API_BASE_URL = 'http://localhost:8081/api/bookings';

export const bookingService = {
  // Create new booking request
  async createBooking(bookingData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  },

  // Get current user's bookings
  async getUserBookings() {
    try {
      const response = await fetch(`${API_BASE_URL}/my`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  },

  // Get all bookings (admin only)
  async getAllBookings(status = null) {
    try {
      const url = status ? `${API_BASE_URL}?status=${status}` : API_BASE_URL;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch all bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Get all bookings error:', error);
      throw error;
    }
  },

  // Get booking by ID
  async getBookingById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Get booking error:', error);
      throw error;
    }
  },

  // Approve booking (admin only)
  async approveBooking(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Approve booking error:', error);
      throw error;
    }
  },

  // Reject booking (admin only)
  async rejectBooking(id, rejectionReason) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rejectionReason),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Reject booking error:', error);
      throw error;
    }
  },

  // Cancel booking
  async cancelBooking(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  },

  // Get pending bookings (admin only)
  async getPendingBookings() {
    try {
      const response = await fetch(`${API_BASE_URL}/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Get pending bookings error:', error);
      throw error;
    }
  },

  // Get bookings by status (admin only)
  async getBookingsByStatus(status) {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${status}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings by status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get bookings by status error:', error);
      throw error;
    }
  }
};
