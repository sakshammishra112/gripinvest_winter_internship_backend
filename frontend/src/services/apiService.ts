
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
export const loginUser = (data: { email: string; password: string }) =>
  api.post('/auth/login', data).then((res) => res.data);

export const signupUser = (data: any) =>
  api.post('/auth/signup', data).then((res) => res.data);

// Dashboard APIs
export const getDashboardSummary = () =>
  api.get('/dashboard/summary').then((res) => res.data);

export const getUserInvestments = () =>
  api.get('/investments/my').then((res) => res.data);


class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    console.log('Auth token:', token);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('API Error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorData = { message: 'Network error' };
      }
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    try {
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Failed to parse response');
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async signup(userData: any) {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async checkPasswordStrength(password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-strength/${encodeURIComponent(password)}`);
    return this.handleResponse(response);
  }

  async initiatePasswordReset(email: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/initiate-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async resetPassword(token: string, otp: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, otp, newPassword }),
    });
    return this.handleResponse(response);
  }
  // new method
  async getUser() {
    const response = await fetch(`${API_BASE_URL}/api/getUser`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User/Profile
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(userData: any) {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Investment Products
  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getProduct(id: string) {
    console.log(`Fetching product ${id} from: ${API_BASE_URL}/api/products/${id}`);
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Include cookies in the request
    });
    return this.handleResponse(response);
  }

  async getProductRecommendations(riskLevel: string) {
    const response = await fetch(`${API_BASE_URL}/api/products/recommend/${riskLevel}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Investments
  async createInvestment(investmentData: any) {
    const response = await fetch(`${API_BASE_URL}/api/investments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(investmentData),
    });
    return this.handleResponse(response);
  }

  async getUserInvestments() {
    const response = await fetch(`${API_BASE_URL}/api/investments/user`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Transaction Logs
  async getUserLogs() {
    const response = await fetch(`${API_BASE_URL}/api/logs/user`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getErrorSummary() {
    const response = await fetch(`${API_BASE_URL}/api/logs/errors/summary`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // AI Insights
  async getPortfolioInsights() {
    const response = await fetch(`${API_BASE_URL}/api/insights/portfolio`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getErrorInsights(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/insights/errors/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();