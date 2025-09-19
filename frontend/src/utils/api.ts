const API_BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making request to:', url);
    console.log('Request options:', options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response text:', errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Network error' };
      }
      throw new Error(error.error || error.message || `Request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      console.log('Empty response received');
      return responseText as T;
    }
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(responseText);
      console.log('Successfully parsed as JSON:', parsed);
      return parsed;
    } catch {
      // If it's not JSON, return as string
      console.log('Not JSON, returning as string');
      return responseText as T;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; message: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, passwordHash: password }),
    });
    localStorage.setItem('authToken', response.token);
    return response;
  }

  async register(userData: any) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async checkPasswordStrength(password: string) {
    return this.request<{ score: number; strength: string; suggestions: string[] }>('/check-password-strength', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otpCode: string) {
    return this.request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  }

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    return this.request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode, newPassword }),
    });
  }

  // Products endpoints
  async getProducts() {
    return this.request<any[]>('/products');
  }

  async getProductById(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async addProduct(productData: any) {
    console.log('Sending product data to API:', productData);
    
    // Ensure all numeric values are properly formatted
    const payload: {
      name: any;
      investmentType: any;
      tenureMonths: number;
      annualYield: number;
      riskLevel: any;
      minInvestment: number;
      description: any;
      maxInvestment?: number;
    } = {
      name: productData.name,
      investmentType: productData.investmentType,
      tenureMonths: Number(productData.tenureMonths) || 0,
      annualYield: Number(productData.annualYield) || 0,
      riskLevel: productData.riskLevel,
      minInvestment: Number(productData.minInvestment) || 0,
      description: productData.description || ''
    };

    // Only include maxInvestment if it has a value
    if (productData.maxInvestment !== undefined && productData.maxInvestment !== null) {
      payload.maxInvestment = Number(productData.maxInvestment);
    }

    console.log('Final payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', response.status, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Network error' };
      }
      throw new Error(error.error || error.message || `Request failed with status ${response.status}`);
    }

    try {
      const responseData = await response.json();
      console.log('Product created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.log('Empty response received');
      return {};
    }
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    console.log('Deleting product with ID:', id);
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting product:', response.status, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Network error' };
      }
      throw new Error(error.error || error.message || `Request failed with status ${response.status}`);
    }

    // For 204 No Content, we don't expect any response body
    if (response.status === 204) {
      console.log('Product deleted successfully (204 No Content)');
      return {};
    }

    // Handle other success status codes if needed
    try {
      const responseData = await response.json();
      console.log('Product deleted successfully:', responseData);
      return responseData;
    } catch (error) {
      console.log('No response body received for delete operation');
      return {};
    }
  }

  async getProductRecommendations(risk: string) {
    try {
      const response = await this.request<any>(`/products/recommend/${risk}`);
      console.log('Raw API response for recommendations:', response);
      return response;
    } catch (error) {
      console.error('API Error for recommendations:', error);
      throw error;
    }
  }

  // Investments endpoints
  async makeInvestment(productId: string, amount: number) {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify({ productId, amount }),
    });
  }

  async getUserPortfolio() {
    return this.request<any[]>('/investments/get-portfolio');
  }

  async getInvestmentById(id: string) {
    return this.request<any>(`/investments/investmentById/${id}`);
  }

  async getInvestmentsOfLoggedUser() {
    return this.request<any[]>('/investments/investmentOfLoggedUser');
  }

  // Portfolio endpoints
  async getPortfolioInsights() {
    return this.request<{ stats: any; aiInsights: string }>('/portfolio/insights');
  }

  async getInvestingTrends() {
    try {
      console.log('Making request to /portfolio/investingTrends');
      const response = await this.request<any>('/portfolio/investingTrends');
      console.log('Investing trends API response:', response);
      return response;
    } catch (error) {
      console.error('API Error for investing trends:', error);
      throw error;
    }
  }

  // Transaction logs endpoints
  async getTransactionLogs() {
    return this.request<any[]>('/logs/user');
  }

  // User balance and returns
  async getUserBalance() {
    return this.request<number>('/users/balance');
  }

  async getTotalReturns() {
    return this.request<{ totalReturns: number }>('/investments/total-returns');
  }

  // User details
  async getUserDetails() {
    return this.request<any>('/users/details');
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const apiClient = new ApiClient();