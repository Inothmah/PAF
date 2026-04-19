const API_BASE_URL = 'http://localhost:8081/api/tickets';

export const ticketService = {
  // Create new incident ticket with attachments
  async createTicket(ticketData, attachments = []) {
    try {
      const formData = new FormData();
      
      // Add ticket data as JSON blob
      formData.append('ticket', new Blob([JSON.stringify(ticketData)], { type: 'application/json' }));
      
      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create ticket');
      }

      return await response.json();
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  },

  // Get current user's tickets
  async getUserTickets() {
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
        throw new Error(errorData.message || 'Failed to fetch user tickets');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user tickets error:', error);
      throw error;
    }
  },

  // Get all tickets (admin/technician)
  async getAllTickets(status = null) {
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
        throw new Error(errorData.message || 'Failed to fetch all tickets');
      }

      return await response.json();
    } catch (error) {
      console.error('Get all tickets error:', error);
      throw error;
    }
  },

  // Get tickets assigned to technician
  async getAssignedTickets() {
    try {
      const response = await fetch(`${API_BASE_URL}/assigned`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch assigned tickets');
      }

      return await response.json();
    } catch (error) {
      console.error('Get assigned tickets error:', error);
      throw error;
    }
  },

  // Get ticket by ID
  async getTicketById(id) {
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
        throw new Error(errorData.message || 'Failed to fetch ticket');
      }

      return await response.json();
    } catch (error) {
      console.error('Get ticket error:', error);
      throw error;
    }
  },

  // Update ticket status (admin/technician)
  async updateTicketStatus(id, statusData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update ticket status');
      }

      return await response.json();
    } catch (error) {
      console.error('Update ticket status error:', error);
      throw error;
    }
  },

  // Add comment to ticket
  async addComment(ticketId, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }

      return await response.json();
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  // Get comments for a ticket
  async getTicketComments(ticketId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}/comments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch comments');
      }

      return await response.json();
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  // Edit comment
  async editComment(commentId, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit comment');
      }

      return await response.json();
    } catch (error) {
      console.error('Edit comment error:', error);
      throw error;
    }
  },

  // Delete comment
  async deleteComment(commentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }

      return true;
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  },

  // Add attachment to ticket
  async addAttachment(ticketId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/${ticketId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add attachment');
      }

      return await response.json();
    } catch (error) {
      console.error('Add attachment error:', error);
      throw error;
    }
  },

  // Get attachments for a ticket
  async getTicketAttachments(ticketId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}/attachments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch attachments');
      }

      return await response.json();
    } catch (error) {
      console.error('Get attachments error:', error);
      throw error;
    }
  },

  // Delete attachment
  async deleteAttachment(attachmentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete attachment');
      }

      return true;
    } catch (error) {
      console.error('Delete attachment error:', error);
      throw error;
    }
  },

  // Get all technicians (for admin assignment)
  async getTechnicians() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/tickets', '')}/users/technicians`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch technicians');
      }

      return await response.json();
    } catch (error) {
      console.error('Get technicians error:', error);
      throw error;
    }
  },

  // Delete ticket
  async deleteTicket(ticketId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete ticket');
      }

      return true;
    } catch (error) {
      console.error('Delete ticket error:', error);
      throw error;
    }
  }
};
