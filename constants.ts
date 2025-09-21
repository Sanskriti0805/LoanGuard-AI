
import { LoanType, LoanTenure, IncomeStability, MonthlyIncome, ExistingEMIs, CIBILScore } from './types';

export const LOAN_TYPES = Object.values(LoanType);
export const LOAN_TENURE_OPTIONS = Object.values(LoanTenure);
export const INCOME_STABILITY_OPTIONS = Object.values(IncomeStability);
export const MONTHLY_INCOME_OPTIONS = Object.values(MonthlyIncome);
export const EXISTING_EMI_OPTIONS = Object.values(ExistingEMIs);
export const CIBIL_SCORE_OPTIONS = Object.values(CIBILScore);

export const APP_NAME = "LoanGuard AI";
export const APP_TAGLINE = "Your AI-powered shield against predatory loans in India.";