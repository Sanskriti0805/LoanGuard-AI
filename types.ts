// FIX: Define enums for loan and user profile options.
export enum LoanType {
  Personal = "Personal Loan",
  Home = "Home Loan",
  Car = "Car Loan",
  Education = "Education Loan",
  Business = "Business Loan",
}

export enum LoanTenure {
  ThreeYears = "3 years",
  FiveYears = "5 years",
  SevenYears = "7 years",
  TenYears = "10 years",
  FifteenYears = "15 years",
  TwentyYears = "20 years",
}

export enum IncomeStability {
  Salaried = "Salaried",
  SelfEmployedStable = "Self-employed (Stable Income)",
  SelfEmployedVariable = "Self-employed (Variable Income)",
  Unemployed = "Unemployed/Student",
}

export enum MonthlyIncome {
  LessThan30k = "Less than ₹30,000",
  From30kTo75k = "₹30,000 - ₹75,000",
  From75kTo150k = "₹75,000 - ₹1,50,000",
  MoreThan150k = "More than ₹1,50,000",
}

export enum ExistingEMIs {
  Zero = "0% of income",
  LessThan10 = "Less than 10% of income",
  From10To30 = "10% - 30% of income",
  MoreThan30 = "More than 30% of income",
}

export enum CIBILScore {
  Excellent = "Excellent (750+)",
  Good = "Good (700-749)",
  Fair = "Fair (650-699)",
  Poor = "Poor (Below 650)",
  NoHistory = "No Credit History",
}

// FIX: Define the UserProfile interface used across components.
export interface UserProfile {
  loanType: LoanType;
  loanAmount: number;
  loanTenure: LoanTenure;
  incomeStability: IncomeStability;
  monthlyIncome: MonthlyIncome;
  existingEMIs: ExistingEMIs;
  cibilScore: CIBILScore;
}

// FIX: Define interfaces for the LoanAnalysisResult.
export interface ExtractedTerms {
  interestRate: string;
  processingFee: string;
  prepaymentPenalty: string;
  latePaymentCharges: string;
  insuranceLinkage: string;
}

export interface RedFlag {
  severity: 'High' | 'Medium' | 'Low';
  indicator: string;
  details: string;
}

export interface TotalCostAnalysis {
    totalPayable: string;
    totalInterest: string;
    totalFees: string;
    interestPercentage: string;
}

export interface AffordabilityMetric {
    value: string;
    details: string;
}

export interface EnhancedAffordability {
    isAffordable: boolean;
    reason: string;
    safeEMILimit: AffordabilityMetric;
    monthlyBurden: AffordabilityMetric;
    recommendedLoanAmount: AffordabilityMetric;
}

export interface DetailedCibilImpact {
    predictionText: string;
    scoreImpact: string;
    defaultRiskWarning: string;
    improvementAdvice: string;
}

export interface MarketRateComparison {
    comparisonText: string;
    potentialSavings: string;
    recommendedLenders: string[];
}

export interface GovernmentSchemeInfo {
    name: string;
    interestRate: string;
    portalLink: string;
}

export interface GovernmentSchemeComparison {
    comparisonText: string;
    potentialSavings: string;
    schemes: GovernmentSchemeInfo[];
}

export interface ActionPlan {
    finalVerdict: 'DO NOT SIGN' | 'Proceed with Caution' | 'Looks Good';
    nextSteps: string[];
}


export interface LoanAnalysisResult {
  loanFitScore: number;
  extractedTerms: ExtractedTerms;
  redFlags: RedFlag[];
  totalCostAnalysis: TotalCostAnalysis;
  enhancedAffordability: EnhancedAffordability;
  detailedCibilImpact: DetailedCibilImpact;
  marketRateComparison: MarketRateComparison;
  governmentSchemeComparison: GovernmentSchemeComparison;
  actionPlan: ActionPlan;
  cibilImpactConfidenceScore?: number;
}


// FIX: Define interfaces for the LoanComparisonResult.
export interface FeatureMatrixItem {
    feature: string;
    offerA: string;
    offerB: string;
}

export interface CIBILHealthAnalysis {
    recommendation: string;
    confidenceScore: number;
}

export interface LoanComparisonResult {
    winner: 'Offer A' | 'Offer B';
    reasoning: string;
    costDifference: string;
    featureMatrix: FeatureMatrixItem[];
    cibilHealthAnalysis?: CIBILHealthAnalysis; // Optional analysis for CIBIL report
}

// FIX: Define the interface for a GovernmentScheme.
export interface GovernmentScheme {
    name: string;
    description: string;
    interestRateComparison: string;
    eligibility: string[];
    applicationGuidance: string;
}