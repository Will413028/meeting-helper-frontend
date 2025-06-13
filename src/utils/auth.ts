export interface User {
  id: string;
  username: string;
  role: string;
}

export const auth = {
  // Get stored authentication token
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  },

  // Get stored user information
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? (JSON.parse(userStr) as User) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.username.toLowerCase() === "admin";
  },

  // Clear authentication data
  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  // Get authorization header for API requests
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
