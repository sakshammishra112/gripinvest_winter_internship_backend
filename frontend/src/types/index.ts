export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  riskAppetite: 'low' | 'moderate' | 'high';
  role: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  description: string;
  productType?: string;
  expectedReturn?: number;
  minimumInvestment?: number;
  riskLevel: 'low' | 'moderate' | 'high';
  maturityPeriod?: number;
  availableUnits?: number;
  isActive?: boolean;
  features?: string[];
  // New backend fields
  investmentType?: string;
  tenureMonths?: number;
  annualYield?: number;
  minInvestment?: number;
  maxInvestment?: number;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  product: InvestmentProduct;
  amount: number;
  units: number;
  investmentDate: string;
  maturityDate: string;
  currentValue: number;
  status: 'ACTIVE' | 'MATURED' | 'CANCELLED';
  profit?: number;
}

export interface TransactionLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount?: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalInvestment: number;
  totalProfit: number;
  activeInvestmentsCount: number;
  maturedInvestmentsCount: number;
}

export interface PasswordStrengthResult {
  score: number;
  strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'VERY_STRONG';
  suggestions: string[];
}