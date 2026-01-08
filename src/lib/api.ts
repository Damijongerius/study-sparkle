/**
 * API Client for Study Buddy Backend
 * Handles all communication with the backend API using session-based authentication
 */

const API_BASE_URL = 'https://studyapi.jongerius.app'; // Replace with your actual API base URL

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an API request with automatic session cookie handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(response.status, `Request failed: ${response.statusText}`);
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || `Request failed: ${response.statusText}`;
    throw new ApiError(response.status, errorMessage);
  }

  return data;
}

/**
 * Auth API
 */
export const authApi = {
  /**
   * Sign up a new user
   */
  async signup(username: string, password: string) {
    // Validate inputs
    if (!username || username.length < 2 || username.length > 20) {
      throw new ApiError(400, 'Username must be 2-20 characters');
    }
    if (!password || password.length < 4) {
      throw new ApiError(400, 'Password must be at least 4 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new ApiError(400, 'Username can only contain letters, numbers, and underscores');
    }

    return apiRequest<{ success: boolean; user: { username: string; friendCode: string } }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
  },

  /**
   * Log in an existing user
   */
  async login(username: string, password: string) {
    if (!username || !password) {
      throw new ApiError(400, 'Username and password required');
    }

    return apiRequest<{ 
      success: boolean; 
      user: { username: string; friendCode: string };
      friends: Array<{ username: string; friendCode: string; addedAt: string }>;
    }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
  },

  /**
   * Log out the current user
   */
  async logout() {
    return apiRequest<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current user session
   */
  async getCurrentUser() {
    return apiRequest<{ 
      user: { username: string; friendCode: string } | null;
      friends?: Array<{ username: string; friendCode: string; addedAt: string }>;
      error?: string;
    }>('/api/auth/me');
  },
};

/**
 * Data API
 */
export const dataApi = {
  /**
   * Get user data
   */
async getUserData() {
  return apiRequest<Record<string, unknown>>('/api/data');
},

/**
 * Update user data
 */
async updateUserData(data: Record<string, unknown>) {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    throw new ApiError(400, 'Invalid data format');
  }

  return apiRequest<Record<string, unknown>>('/api/data', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
},

/**
 * Add activity log entry
 */
async addActivity(activity: {
  type: string;
  timestamp?: Date | string;
  details?: Record<string, unknown>;
}) {
  const timestamp =
    activity.timestamp instanceof Date
      ? activity.timestamp.toISOString()
      : activity.timestamp ?? new Date().toISOString();

  return apiRequest<{ success: boolean }>('/api/activity', {
    method: 'POST',
    body: JSON.stringify({
      ...activity,
      timestamp,
    }),
  });
},
  /**
   * Deduct points
   */
  async deductPoints(amount: number, reason: string) {
    if (!amount || amount <= 0 || amount > 100) {
      throw new ApiError(400, 'Invalid deduction amount');
    }

    return apiRequest<{ success: boolean; newTotal: number }>('/api/points/deduct', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },
};

/**
 * Friends API
 */
export const friendsApi = {
  /**
   * Add a friend by friend code
   */
  async addFriend(friendCode: string) {
    if (!friendCode || typeof friendCode !== 'string') {
      throw new ApiError(400, 'Friend code is required');
    }

    const normalizedCode = friendCode.toUpperCase().trim();
    if (normalizedCode.length !== 6) {
      throw new ApiError(400, 'Friend code must be 6 characters');
    }

    return apiRequest<{ 
      success: boolean; 
      friend: { username: string; friendCode: string };
      error?: string;
    }>('/api/friends/add', {
      method: 'POST',
      body: JSON.stringify({ friendCode: normalizedCode }),
    });
  },

  /**
   * Remove a friend
   */
  async removeFriend(friendCode: string) {
    return apiRequest<{ success: boolean }>(`/api/friends/${friendCode}`, {
      method: 'DELETE',
    });
  },

  /**
   * Look up a friend by code (for validation)
   */
  async lookupFriend(friendCode: string) {
    return apiRequest<{ username: string; friendCode: string }>(
      `/api/friends/lookup/${friendCode}`
    );
  },
};

/**
 * Gift Cards API
 */
export const giftCardApi = {
  /**
   * Send a gift card to a friend
   */
  async sendGiftCard(
    toUsername: string,
    name: string,
    goal: string,
    slots: number,
    allowedCategories?: string[]
  ) {
    // Validate inputs
    if (!toUsername || !name) {
      throw new ApiError(400, 'Recipient and card name are required');
    }
    if (!slots || slots < 6 || slots > 25) {
      throw new ApiError(400, 'Slots must be between 6 and 25');
    }
    if (name.length > 40) {
      throw new ApiError(400, 'Card name must be 40 characters or less');
    }
    if (goal && goal.length > 150) {
      throw new ApiError(400, 'Goal must be 150 characters or less');
    }

    return apiRequest<{ success: boolean }>('/api/gift-card', {
      method: 'POST',
      body: JSON.stringify({
        toUsername,
        name,
        goal,
        slots,
        allowedCategories: allowedCategories || [],
      }),
    });
  },
};

/**
 * Notifications API
 */
export const notificationsApi = {
  /**
   * Get notifications
   */
  async getNotifications() {
    return apiRequest<{ notifications: unknown[] }>('/api/notifications');
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return apiRequest<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Clear all notifications
   */
  async clearAll() {
    return apiRequest<{ success: boolean }>('/api/notifications', {
      method: 'DELETE',
    });
  },
};

/**
 * Cards API
 */
export const cardsApi = {
  /**
   * Complete a card
   */
  async completeCard(cardId: string) {
    return apiRequest<{ success: boolean }>(`/api/cards/${cardId}/complete`, {
      method: 'POST',
    });
  },
};

export { ApiError };

