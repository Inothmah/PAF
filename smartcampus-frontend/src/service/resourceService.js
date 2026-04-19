const API_BASE_URL = 'http://localhost:8080/api/resources';

export const resourceService = {
  // Get all resources with optional filters
  async getAllResources(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
      if (filters.location) params.append('location', filters.location);
      if (filters.name) params.append('name', filters.name);

      const response = await fetch(`${API_BASE_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch resources');
      }

      return await response.json();
    } catch (error) {
      console.error('Get resources error:', error);
      throw error;
    }
  },

  // Get resource by ID
  async getResourceById(id) {
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
        throw new Error(errorData.message || 'Failed to fetch resource');
      }

      return await response.json();
    } catch (error) {
      console.error('Get resource error:', error);
      throw error;
    }
  },

  // Create new resource (Admin only)
  async createResource(resourceData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create resource');
      }

      return await response.json();
    } catch (error) {
      console.error('Create resource error:', error);
      throw error;
    }
  },

  // Update resource (Admin only)
  async updateResource(id, resourceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update resource');
      }

      return await response.json();
    } catch (error) {
      console.error('Update resource error:', error);
      throw error;
    }
  },

  // Delete resource (Admin only)
  async deleteResource(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete resource');
      }

      return true;
    } catch (error) {
      console.error('Delete resource error:', error);
      throw error;
    }
  },

  // Get resources by type
  async getResourcesByType(type) {
    try {
      const response = await fetch(`${API_BASE_URL}/type/${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch resources by type');
      }

      return await response.json();
    } catch (error) {
      console.error('Get resources by type error:', error);
      throw error;
    }
  },

  // Get resources by status
  async getResourcesByStatus(status) {
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
        throw new Error(errorData.message || 'Failed to fetch resources by status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get resources by status error:', error);
      throw error;
    }
  },

  // Get resources by location
  async getResourcesByLocation(location) {
    try {
      const response = await fetch(`${API_BASE_URL}/location/${location}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch resources by location');
      }

      return await response.json();
    } catch (error) {
      console.error('Get resources by location error:', error);
      throw error;
    }
  },

  // Get active resources (for catalogue)
  async getActiveResources() {
    try {
      const response = await fetch(`${API_BASE_URL}/active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active resources');
      }

      return await response.json();
    } catch (error) {
      console.error('Get active resources error:', error);
      throw error;
    }
  }
};
