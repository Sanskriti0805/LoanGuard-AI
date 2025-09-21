import React, { useState } from 'react';
// FIX: Update imports for React 18 createRoot API.
// `render` and `unmountComponentAtNode` are deprecated.
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { LoanAnalysisResult, UserProfile, RedFlag, ExtractedTerms, ActionPlan, TotalCostAnalysis, EnhancedAffordability, DetailedCibilImpact, MarketRateComparison, GovernmentSchemeComparison } from '../types';
import { analyzeLoanAgreement } from '../services/geminiService';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TextArea } from './common/TextArea';
import { Loader } from './common/Loader';
import { Alert } from './common/Alert';

interface LoanSafetyAnalyzerProps {
  userProfile: UserProfile;
  cibilReportFile: File | null;
}

const LOAN_EXAMPLES = [
  {
    title: 'Example: Predatory Loan',
    description: 'High fees and unfavorable terms. See how the AI flags these issues.',
    text: `Interest Rate: 28% (Flat Rate)\nProcessing Fee: 5% of loan amount + 18% GST\nPrepayment Penalty: 6% on the entire initial principal if closed before 3 years.\nMandatory: You must purchase a life insurance policy from our partner company, premiums will be added to EMI.\nLate Fee: ₹1500 + 3% of EMI amount per month.`
  },
  {
    title: 'Example: Good Loan Offer',
    description: 'Competitive terms with borrower-friendly features.',
    text: `Interest Rate: 11.5% (Reducing Balance)\nProcessing Fee: ₹1,999 + GST (Special Offer)\nPrepayment Penalty: 0% (Nil) on early closure after 12 EMIs.\nLate Fee: 2% of overdue EMI amount.\nNo requirement for linked insurance.`
  },
  {
    title: 'Example: Standard Car Loan',
    description: 'A typical offer for a vehicle loan with standard clauses.',
    text: `Interest Rate: 13% p.a. (Reducing)\nLoan Amount: ₹8,00,000\nTenure: 5 years\nProcessing Fee: 1.5% of the loan amount.\nForeclosure Charges: 3% on the outstanding principal if closed within the first 2 years, 2% thereafter.`
  }
];

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = () => {
        if (score >= 75) return 'text-brand-success';
        if (score >= 50) return 'text-brand-warning';
        return 'text-brand-danger';
    };
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle className={`${getScoreColor()} transition-all duration-1000 ease-out`} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" transform="rotate(-90 50 50)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
                <span className="text-sm font-medium text-gray-500">/ 100</span>
            </div>
        </div>
    );
};

const RedFlagItem: React.FC<{ flag: RedFlag }> = ({ flag }) => {
    const severityClasses = {
        High: 'border-red-500 bg-red-50',
        Medium: 'border-yellow-500 bg-yellow-50',
        Low: 'border-blue-500 bg-blue-50'
    };
    return (
        <div className={`p-4 border-l-4 rounded ${severityClasses[flag.severity]}`}>
            <h4 className="font-bold text-gray-800">{flag.indicator}</h4>
            <p className="text-sm text-gray-600">{flag.details}</p>
        </div>
    );
};

const TermsVisualizationChart: React.FC<{ terms: ExtractedTerms }> = ({ terms }) => {
    const parseValue = (text: string): number => {
        if (!text || text.toLowerCase().includes('not mentioned')) return 0;
        const match = text.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    };

    const chartData = [
        { label: 'Interest Rate (%)', value: parseValue(terms.interestRate), originalText: terms.interestRate, color: 'bg-brand-primary' },
        { label: 'Processing Fee (%)', value: parseValue(terms.processingFee), originalText: terms.processingFee, color: 'bg-brand-secondary' },
        { label: 'Prepayment Penalty (%)', value: parseValue(terms.prepaymentPenalty), originalText: terms.prepaymentPenalty, color: 'bg-brand-accent' },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value), 15); // Use 15 as a minimum max for a stable scale

    return (
        <Card>
            <h4 className="text-xl font-bold text-brand-dark mb-4">Key Terms at a Glance</h4>
            <div className="space-y-4">
                {chartData.map(item => (
                    <div key={item.label} className="grid grid-cols-3 items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 truncate">{item.label}</span>
                        <div className="col-span-2 bg-gray-200 rounded-full h-6">
                            <div
                                className={`${item.color} h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold transition-all duration-1000 ease-out`}
                                style={{ width: item.value > 0 ? `${Math.min((item.value / maxValue) * 100, 100)}%` : '0%' }}
                                title={item.originalText}
                            >
                                <span className="truncate">{item.originalText}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <p className="text-xs text-gray-500 mt-3 text-right">Note: Chart visualizes the primary numerical value found in each term for comparison.</p>
        </Card>
    );
};

const InterestRateSlider: React.FC<{ rateText: string }> = ({ rateText }) => {
    const parseRate = (text: string): number => {
        if (!text || text.toLowerCase().includes('not mentioned')) return 0;
        const match = text.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    };

    const rate = parseRate(rateText);
    const maxRate = 30; // A reasonable maximum for personal/unsecured loans in India
    const percentage = Math.min((rate / maxRate) * 100, 100);

    const colorInfo = (() => {
        if (rate <= 12) return { bg: 'bg-brand-success', border: 'border-t-brand-success' };
        if (rate <= 18) return { bg: 'bg-brand-warning', border: 'border-t-brand-warning' };
        return { bg: 'bg-brand-danger', border: 'border-t-brand-danger' };
    })();
    
    // Have to list full classes for Tailwind JIT compiler to work:
    // border-t-brand-success border-t-brand-warning border-t-brand-danger
    
    return (
        <Card>
            <h4 className="text-xl font-bold text-brand-dark mb-2">Interest Rate Analysis</h4>
            <div className="relative pt-10 pb-4">
                {/* Slider Track */}
                <div className="h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full"></div>

                {/* Slider Thumb - positioned relative to the track's parent */}
                <div
                    className="absolute top-4 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000 ease-out"
                    style={{ left: `${percentage}%` }}
                >
                    <div className={`w-14 h-14 rounded-full ${colorInfo.bg} flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white`}>
                        {rate > 0 ? `${rate.toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className={`w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${colorInfo.border}`}></div>
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs font-medium text-gray-500 mt-3 relative">
                    <span className="transform -translate-x-1/2">0%</span>
                    <span className="absolute transform -translate-x-1/2" style={{left: `${(10/maxRate)*100}%`}}>10%</span>
                    <span className="absolute transform -translate-x-1/2" style={{left: `${(15/maxRate)*100}%`}}>15%</span>
                    <span className="absolute transform -translate-x-1/2" style={{left: `${(20/maxRate)*100}%`}}>20%</span>
                    <span className="transform translate-x-1/2">{maxRate}%</span>
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
                <strong>Extracted Rate:</strong> {rateText}. The slider shows where this rate stands compared to typical market ranges. Lower is better.
            </p>
        </Card>
    );
};

// --- NEW DETAILED RESULT SECTIONS ---

const ActionPlanSection: React.FC<{ plan: ActionPlan }> = ({ plan }) => {
    const verdictInfo = {
        'DO NOT SIGN': {
            borderColor: 'border-red-500',
            textColor: 'text-red-600',
            icon: '🛑',
            title: "Final Verdict: Do Not Sign",
        },
        'Proceed with Caution': {
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-600',
            icon: '⚠️',
            title: "Final Verdict: Proceed with Caution",
        },
        'Looks Good': {
            borderColor: 'border-green-500',
            textColor: 'text-green-600',
            icon: '✅',
            title: "Final Verdict: Looks Good",
        }
    };
    const currentVerdict = verdictInfo[plan.finalVerdict];

    return (
        <Card className={`border-t-8 ${currentVerdict.borderColor}`}>
            <div className="flex items-start mb-4">
                 <span className="text-3xl mr-4">{currentVerdict.icon}</span>
                 <div>
                    <h2 className={`text-xl font-bold ${currentVerdict.textColor}`}>{currentVerdict.title}</h2>
                    <p className="text-sm text-gray-500">Based on our comprehensive analysis, here is our top recommendation.</p>
                 </div>
            </div>
            <div>
                 <h4 className="font-bold text-lg mb-2 text-brand-dark">Recommended Action Plan:</h4>
                 <ul className="list-decimal list-inside space-y-2 text-gray-700">
                     {plan.nextSteps.map((step, index) => <li key={index}>{step}</li>)}
                 </ul>
            </div>
        </Card>
    );
};

const TotalCostSection: React.FC<{ cost: TotalCostAnalysis }> = ({ cost }) => (
    <Card>
        <h4 className="text-xl font-bold text-brand-dark mb-4">Total Cost of Your Loan</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Total You Will Pay</p>
                <p className="text-xl font-bold text-brand-dark">{cost.totalPayable}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Total Interest Paid</p>
                <p className="text-xl font-bold text-brand-dark">{cost.totalInterest}</p>
            </div>
        </div>
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
             <p className="font-bold text-red-700">You'll pay {cost.interestPercentage} extra in interest and fees over the loan's lifetime.</p>
        </div>
    </Card>
);

const EnhancedAffordabilitySection: React.FC<{ affordability: EnhancedAffordability }> = ({ affordability }) => (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Safe EMI Limit card */}
        <div className="md:col-span-2 p-6 bg-blue-50 rounded-lg flex flex-col">
            <strong className="block text-brand-dark font-semibold text-xs uppercase tracking-wider mb-2">SAFE EMI LIMIT (RBI):</strong>
            <p className="text-brand-dark font-bold text-3xl">{affordability.safeEMILimit.value}</p>
            <p className="text-brand-dark text-lg mt-1 font-semibold">{affordability.safeEMILimit.details}</p>
        </div>
        {/* Potential Monthly Burden card */}
        <div className="md:col-span-2 p-6 bg-yellow-50 rounded-lg flex flex-col">
            <strong className="block text-brand-dark font-semibold text-xs uppercase tracking-wider mb-2">POTENTIAL MONTHLY BURDEN:</strong>
            <p className="text-brand-dark font-bold text-3xl">{affordability.monthlyBurden.value}</p>
            <p className="text-brand-dark text-lg mt-1 font-semibold">{affordability.monthlyBurden.details}</p>
        </div>
        {/* Recommended Loan Amount card */}
        <div className="md:col-span-3 p-6 bg-green-50 rounded-lg flex flex-col">
            <strong className="block text-brand-dark font-semibold text-xs uppercase tracking-wider mb-2">RECOMMENDED LOAN AMOUNT:</strong>
            <p className="text-brand-dark font-bold text-3xl">{affordability.recommendedLoanAmount.value}</p>
            <p className="text-brand-dark text-lg mt-1 font-semibold">{affordability.recommendedLoanAmount.details}</p>
        </div>
    </div>
);

const DetailedCibilImpactSection: React.FC<{ cibil: DetailedCibilImpact, confidence?: number }> = ({ cibil, confidence }) => (
    <Card>
        <h4 className="text-xl font-bold text-brand-dark mb-4">Detailed CIBIL Impact</h4>
        <p className="text-gray-700 text-sm mb-4"><strong>Prediction: </strong>{cibil.predictionText}</p>
        
        <p className="text-brand-danger text-sm my-4">{cibil.defaultRiskWarning}</p>

        <div className="space-y-4 text-sm">
            <p><strong>Score Impact:</strong> {cibil.scoreImpact}</p>
            <p><strong>Advice:</strong> {cibil.improvementAdvice}</p>
        </div>
        {confidence && (
             <div className="mt-6">
                <h5 className="font-semibold text-sm text-gray-600 mb-1">Prediction Confidence (from CIBIL report)</h5>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-brand-secondary h-2.5 rounded-full" style={{width: `${confidence}%`}}></div>
                </div>
                <p className="text-right text-xs font-bold text-brand-secondary">{confidence}%</p>
             </div>
        )}
    </Card>
);

const MarketComparisonSection: React.FC<{ market: MarketRateComparison }> = ({ market }) => (
    <Card>
        <h4 className="text-xl font-bold text-brand-dark mb-4">Market Rate Comparison</h4>
        <p className="text-gray-700 text-sm mb-3">{market.comparisonText}</p>
        <div className="my-4 p-4 text-center bg-green-100 border-2 border-dashed border-green-400 rounded-lg">
            <p className="text-lg font-bold text-green-800">Potential Savings: <span className="text-2xl">{market.potentialSavings}</span></p>
            <p className="text-sm text-green-700">by choosing a better lender.</p>
        </div>
        <div>
            <h5 className="font-semibold text-sm text-brand-dark">Consider approaching these lenders:</h5>
            <div className="flex flex-wrap gap-2 mt-2">
                {market.recommendedLenders.map(lender => <span key={lender} className="bg-brand-light text-brand-dark px-3 py-1 rounded-full text-sm font-medium">{lender}</span>)}
            </div>
        </div>
    </Card>
);

const GovernmentAlternativesSection: React.FC<{ gov: GovernmentSchemeComparison }> = ({ gov }) => (
    <Card className="bg-blue-50">
        <h4 className="text-xl font-bold text-brand-primary mb-4">Better Government Alternatives</h4>
        <p className="text-gray-700 text-sm mb-3">{gov.comparisonText}</p>
         {gov.potentialSavings !== "₹0" && (
            <div className="my-4 p-4 text-center bg-brand-accent/20 border-2 border-dashed border-brand-accent rounded-lg">
                <p className="text-lg font-bold text-yellow-900">Potential Savings: <span className="text-2xl">{gov.potentialSavings}</span></p>
                <p className="text-sm text-yellow-800">with a government-backed scheme!</p>
            </div>
        )}
        <div className="space-y-3">
            {gov.schemes.length > 0 ? gov.schemes.map(scheme => (
                <div key={scheme.name} className="p-3 bg-white rounded-md shadow-sm">
                    <h5 className="font-bold text-brand-dark">{scheme.name}</h5>
                    <p className="text-sm text-gray-600"><strong>Interest Rate:</strong> {scheme.interestRate}</p>
                    <a href={scheme.portalLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-primary hover:underline">
                        Visit Portal &rarr;
                    </a>
                </div>
            )) : <p className="text-sm text-gray-600">No specific schemes found for this loan purpose.</p>}
        </div>
    </Card>
);


const PrintableAnalysis: React.FC<{ result: LoanAnalysisResult }> = ({ result }) => (
    <div className="p-8 font-sans">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">LoanGuard AI - Comprehensive Analysis</h1>
        <hr className="mb-6"/>

        <div className={`p-4 my-4 text-center text-white rounded-lg ${
            result.actionPlan.finalVerdict === 'DO NOT SIGN' ? 'bg-red-600' :
            result.actionPlan.finalVerdict === 'Proceed with Caution' ? 'bg-yellow-500' : 'bg-green-600'
        }`}>
            <h2 className="text-2xl font-black">{result.actionPlan.finalVerdict}</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-brand-dark mb-2">Loan Fit Score: {result.loanFitScore}/100</h3>
                <p className="text-sm">Represents how well this loan fits your financial profile and risk tolerance.</p>
            </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-brand-dark mb-2">Total Cost Analysis</h3>
                <p className="text-sm"><strong>Total Payable:</strong> {result.totalCostAnalysis.totalPayable}</p>
                <p className="text-sm"><strong>Total Interest:</strong> {result.totalCostAnalysis.totalInterest}</p>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-xl font-semibold text-brand-dark mb-2">Action Plan</h3>
            <ul className="list-decimal list-inside space-y-1 text-sm">
                 {result.actionPlan.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
        </div>
        
        {result.redFlags && result.redFlags.length > 0 && (
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Red Flag Alerts!</h3>
                 {result.redFlags.map((flag, index) => (
                    <div key={index} className="border-l-4 border-red-500 p-3 bg-red-50 mb-2">
                        <h4 className="font-bold text-sm">{flag.indicator} (Severity: {flag.severity})</h4>
                        <p className="text-xs">{flag.details}</p>
                    </div>
                ))}
            </div>
        )}
        
        <div className="mb-6">
             <h3 className="text-xl font-semibold text-brand-dark mb-2">Affordability & CIBIL Impact</h3>
             <p className="text-sm"><strong>Affordability:</strong> {result.enhancedAffordability.reason}</p>
             <p className="text-sm"><strong>Safe EMI Limit:</strong> {result.enhancedAffordability.safeEMILimit.value} {result.enhancedAffordability.safeEMILimit.details}</p>
             <p className="text-sm"><strong>Predicted CIBIL Impact:</strong> {result.detailedCibilImpact.predictionText}</p>
        </div>
        
        <div className="mb-6">
             <h3 className="text-xl font-semibold text-brand-dark mb-2">Market & Government Alternatives</h3>
             <p className="text-sm"><strong>Market Comparison:</strong> {result.marketRateComparison.comparisonText} Potential Savings: {result.marketRateComparison.potentialSavings}.</p>
             <p className="text-sm"><strong>Government Schemes:</strong> {result.governmentSchemeComparison.comparisonText} Potential Savings: {result.governmentSchemeComparison.potentialSavings}.</p>
        </div>

        <div className="mb-6">
            <h3 className="text-xl font-semibold text-brand-dark mb-2">Key Terms Extracted</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Interest Rate:</strong> {result.extractedTerms.interestRate}</li>
                <li><strong>Processing Fee:</strong> {result.extractedTerms.processingFee}</li>
                <li><strong>Prepayment Penalty:</strong> {result.extractedTerms.prepaymentPenalty}</li>
            </ul>
        </div>
    </div>
);


export const LoanSafetyAnalyzer: React.FC<LoanSafetyAnalyzerProps> = ({ userProfile, cibilReportFile }) => {
  const [loanText, setLoanText] = useState('');
  const [result, setResult] = useState<LoanAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (userProfile.loanAmount <= 0) {
        setError('Please enter a valid loan amount in your profile.');
        return;
    }
    if (!loanText.trim()) {
      setError('Please paste your loan agreement text.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeLoanAgreement(loanText, userProfile, cibilReportFile);
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // FIX: Use createRoot API for React 18, which replaces ReactDOM.render.
  // Use flushSync to ensure the component renders before the print dialog opens.
  const handlePrint = () => {
    if (!result) return;
    const printArea = document.getElementById('print-area');
    if (printArea) {
      const root = createRoot(printArea);
      flushSync(() => {
        root.render(<PrintableAnalysis result={result} />);
      });
      window.print();
      root.unmount();
    }
  };

  const handleShare = () => {
      if (!result) return;
      const summary = `I analyzed a loan with LoanGuard AI and got a crucial verdict: "${result.actionPlan.finalVerdict}"!
- *Loan Fit Score*: ${result.loanFitScore}/100
- *Total Interest*: ${result.totalCostAnalysis.totalInterest}
- *Key Finding*: The AI recommended alternative lenders that could save me ${result.marketRateComparison.potentialSavings}.

Check your own loans with LoanGuard AI!`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
      window.open(whatsappUrl, '_blank');
  };

  return (
    <Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="no-print">
          <h3 className="text-xl font-bold text-brand-dark mb-4">Loan Safety Analyzer</h3>
          <p className="text-gray-600 mb-6">Paste your loan agreement text or key details below. Our AI will perform a 360-degree analysis covering costs, risks, and better alternatives.</p>
          
          <div className="my-6">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Not sure where to start? Try an example:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LOAN_EXAMPLES.map((example, index) => (
                <Card key={index} className="bg-gray-50 p-4 hover:shadow-md">
                  <h5 className="font-bold text-brand-dark">{example.title}</h5>
                  <p className="text-xs text-gray-500 mb-3">{example.description}</p>
                  <Button
                    variant="secondary"
                    className="w-full text-sm py-2"
                    onClick={() => setLoanText(example.text)}
                    disabled={isLoading}
                  >
                    Use This Example
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <TextArea
            label="Loan Agreement Text or Key Details"
            value={loanText}
            onChange={(e) => setLoanText(e.target.value)}
            placeholder="e.g., Interest Rate: 12.5% (reducing), Processing Fee: 2% + GST, Prepayment penalty: 4% on outstanding principal..."
            disabled={isLoading}
          />
          <Button onClick={handleAnalyze} isLoading={isLoading} className="mt-4 w-full">
            {isLoading ? 'Analyzing...' : 'Run Comprehensive Analysis'}
          </Button>
          {error && <div className="mt-4"><Alert message={error} type="error" /></div>}
        </div>

        <div>
            {isLoading && <Loader message="AI is running a deep analysis... This is worth the wait." />}
            
            {result && (
                 <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-brand-dark">Comprehensive Analysis</h3>
                        <div className="flex space-x-2 no-print">
                           <button onClick={handleShare} title="Share on WhatsApp" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.908 6.188l.29.443-1.182 4.324 4.463-1.168.418.243z"/></svg>
                           </button>
                           <button onClick={handlePrint} title="Download Summary (PDF)" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           </button>
                        </div>
                    </div>

                    <ActionPlanSection plan={result.actionPlan} />

                    <Card className="bg-gray-50 flex flex-col sm:flex-row items-center gap-6">
                        <ScoreCircle score={result.loanFitScore} />
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-brand-dark">Loan Fit Score</h4>
                            <p className="text-gray-600">This score represents how well this loan fits your financial profile and risk tolerance. A higher score is better.</p>
                        </div>
                    </Card>

                    <TotalCostSection cost={result.totalCostAnalysis} />

                    <InterestRateSlider rateText={result.extractedTerms.interestRate} />
                    
                    <EnhancedAffordabilitySection affordability={result.enhancedAffordability} />
                    
                    <DetailedCibilImpactSection cibil={result.detailedCibilImpact} confidence={result.cibilImpactConfidenceScore} />

                    <MarketComparisonSection market={result.marketRateComparison} />
                    
                    <GovernmentAlternativesSection gov={result.governmentSchemeComparison} />

                     <Card>
                        <h4 className="text-xl font-bold text-brand-dark mb-4">Extracted Loan Terms</h4>
                         <ul className="list-disc list-inside space-y-1 text-gray-700">
                             <li><strong>Interest Rate:</strong> {result.extractedTerms.interestRate}</li>
                             <li><strong>Processing Fee:</strong> {result.extractedTerms.processingFee}</li>
                             <li><strong>Prepayment Penalty:</strong> {result.extractedTerms.prepaymentPenalty}</li>
                             <li><strong>Late Payment Charges:</strong> {result.extractedTerms.latePaymentCharges}</li>
                             <li><strong>Insurance Linkage:</strong> {result.extractedTerms.insuranceLinkage}</li>
                         </ul>
                     </Card>
                     
                    <TermsVisualizationChart terms={result.extractedTerms} />

                     {result.redFlags && result.redFlags.length > 0 && (
                         <Card className="border-2 border-brand-danger">
                             <h4 className="text-xl font-bold text-brand-danger mb-2">🚨 Red Flag Alerts!</h4>
                             <div className="space-y-3">
                                 {result.redFlags.map((flag, index) => <RedFlagItem key={index} flag={flag} />)}
                             </div>
                         </Card>
                     )}
                </div>
            )}
        </div>
      </div>
    </Card>
  );
};