import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { apiClient } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface User {
	id?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	riskAppetite?: 'LOW' | 'MEDIUM' | 'HIGH';
	balance?: number;
	role?: 'USER' | 'ADMIN';
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  riskAppetite?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  updateUser: (userData: UpdateUserData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		// Bootstrap auth state based on token presence
		const token = localStorage.getItem('authToken');
		if (token) {
			// Backend does not expose a current-user endpoint in provided controllers
			// Keep minimal session: token present => authenticated; optionally load lightweight user from storage later
			setUser({} as User);
			// Load balance for navbar and dashboards
			Promise.allSettled([apiClient.getUserDetails(), apiClient.getUserBalance()])
				.then(([detailsRes, balanceRes]) => {
					const details = detailsRes.status === 'fulfilled' ? detailsRes.value : {};
					const balance = balanceRes.status === 'fulfilled' ? balanceRes.value : undefined;
					setUser((prev) => ({
						...(prev || {}),
						id: details.id,
						email: details.email,
						firstName: details.firstName,
						lastName: details.lastName,
						riskAppetite: details.riskAppetite,
						balance: balance ?? details.balance,
						role: details.role,
					} as User));
				});
		}
		setLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		await apiClient.login(email, password);
		// token is already stored by apiClient.login
		// No user payload from backend login; set to minimal object
		setUser({ email } as User);
		try {
			const [details, balance] = await Promise.all([
				apiClient.getUserDetails(),
				apiClient.getUserBalance(),
			]);
			setUser((prev) => ({
				...(prev || { email }),
				id: details.id,
				email: details.email,
				firstName: details.firstName,
				lastName: details.lastName,
				riskAppetite: details.riskAppetite,
				balance: balance ?? details.balance,
				role: details.role,
			} as User));
		} catch {}
	};

	const register = async (userData: any) => {
		try {
			await apiClient.register(userData);
			// Registration successful - return true to indicate success
			return true;
		} catch (error) {
			console.error('Registration error:', error);
			throw error; // Re-throw to be handled by the component
		}
	};

	const logout = useCallback(() => {
		apiClient.logout();
		setUser(null);
		navigate('/'); // Redirect to landing page after logout
	}, [navigate]);

	const isAuthenticated = useMemo(() => !!localStorage.getItem('authToken'), [user]);

	const updateUser = async (userData: UpdateUserData) => {
		try {
			// In a real app, you would make an API call to update the user
			// For now, we'll just update the local state
			setUser(prev => ({
				...prev,
				...userData,
			} as User));
		} catch (error) {
			console.error('Error updating user:', error);
			throw error;
		}
	};

	const value: AuthContextType = {
		user,
		loading,
		login,
		register,
		updateUser,
		logout,
		isAuthenticated,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};