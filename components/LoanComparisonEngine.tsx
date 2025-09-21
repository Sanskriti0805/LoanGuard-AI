import React, { useState } from 'react';
// FIX: Update imports for React 18 createRoot API.
// `render` and `unmountComponentAtNode` are deprecated.
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { LoanComparisonResult, UserProfile } from '../types';
import { compareLoanOffers } from '../services/geminiService';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TextArea } from './common/TextArea';
import { Loader } from './common/Loader';
import { Alert } from './common/Alert';

interface LoanComparisonEngineProps {
  userProfile: UserProfile;
  cibilReportFile: File | null;
}

const LOAN_COMPARISON_EXAMPLES = [
  {
    title: 'Low Interest vs. Zero Fees',
    description: 'One offer has a lower rate but high fees, the other has a slightly higher rate but no processing fee.',
    offerA: `Bank A Personal Loan\nInterest Rate: 11.99% (Reducing)\nProcessing Fee: 2% of loan amount + GST`,
    offerB: `Bank B Personal Loan\nInterest Rate: 12.75% (Reducing)\nProcessing Fee: ₹0 (Zero Fee Festival Offer)`
  },
  {
    title: 'Flexibility vs. Low EMI',
    description: 'Compare an offer with no prepayment penalty against one with a lower EMI but strict foreclosure charges.',
    offerA: `Flexible Loan Corp\nInterest Rate: 14% (Reducing)\nPrepayment Penalty: 0% after 6 EMIs.\nLate Fee: 2% of EMI.`,
    offerB: `Budget Loans Ltd.\nInterest Rate: 13.5% (Reducing)\nPrepayment Penalty: 5% on outstanding principal for entire tenure.\nLate Fee: ₹1000 flat.`
  },
  {
    title: 'Bank vs. NBFC',
    description: 'A standard bank offer versus a quicker, but more expensive, Non-Banking Financial Company (NBFC) loan.',
    offerA: `National Bank Car Loan\nInterest Rate: 9.5% (Reducing)\nProcessing Fee: 1%\nRequires extensive documentation.`,
    offerB: `SpeedyFinance Car Loan\nInterest Rate: 15% (Flat Rate)\nProcessing Fee: 2.5%\nInstant approval with minimal documents.`
  }
];

const PrintableComparison: React.FC<{ result: LoanComparisonResult }> = ({ result }) => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">LoanGuard AI - Comparison Summary</h1>
        <hr className="mb-6"/>

        <div className="text-center mb-6 p-4 bg-green-100 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800">Winner: {result.winner}</h2>
            <p className="italic mt-1">"{result.reasoning}"</p>
            <p className="font-bold mt-2">Potential Savings: {result.costDifference}</p>
        </div>

        <h3 className="text-xl font-semibold text-brand-dark mb-2">Feature Comparison Matrix</h3>
        <table className="w-full text-sm text-left border-collapse border border-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                    <th className="px-4 py-2 border border-gray-300">Feature</th>
                    <th className="px-4 py-2 border border-gray-300">Offer A</th>
                    <th className="px-4 py-2 border border-gray-300">Offer B</th>
                </tr>
            </thead>
            <tbody>
                {result.featureMatrix.map((item, index) => (
                    <tr key={index} className="bg-white border-b">
                        <td className="px-4 py-2 border border-gray-300 font-medium">{item.feature}</td>
                        <td className="px-4 py-2 border border-gray-300">{item.offerA}</td>
                        <td className="px-4 py-2 border border-gray-300">{item.offerB}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const LoanComparisonEngine: React.FC<LoanComparisonEngineProps> = ({ userProfile, cibilReportFile }) => {
  const [loanOfferA, setLoanOfferA] = useState('');
  const [loanOfferB, setLoanOfferB] = useState('');
  const [result, setResult] = useState<LoanComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!loanOfferA.trim() || !loanOfferB.trim()) {
      setError('Please provide details for both loan offers.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setResult(null);
    try {
      const comparison = await compareLoanOffers(loanOfferA, loanOfferB, userProfile, cibilReportFile);
      setResult(comparison);
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
                root.render(<PrintableComparison result={result} />);
            });
            window.print();
            root.unmount();
        }
    };

    const handleShare = () => {
        if (!result) return;
        const summary = `LoanGuard AI helped me compare two loans!
- *Winner*: ${result.winner}
- *Reason*: ${result.reasoning}
- *Potential Savings*: ${result.costDifference}

You should try it too!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
        window.open(whatsappUrl, '_blank');
    };

  return (
    <Card>
      <h3 className="text-xl font-bold text-brand-dark mb-4">Loan Comparison Engine</h3>
      <p className="text-gray-600 mb-6">Paste the details of two different loan offers. Our AI will perform a side-by-side analysis and recommend the best option for you.</p>

      <div className="my-6 no-print">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Not sure where to start? Try an example comparison:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOAN_COMPARISON_EXAMPLES.map((example, index) => (
            <Card key={index} className="bg-gray-50 p-4 hover:shadow-md">
              <h5 className="font-bold text-brand-dark">{example.title}</h5>
              <p className="text-xs text-gray-500 mb-3">{example.description}</p>
              <Button
                variant="secondary"
                className="w-full text-sm py-2"
                onClick={() => {
                  setLoanOfferA(example.offerA);
                  setLoanOfferB(example.offerB);
                }}
                disabled={isLoading}
              >
                Use This Example
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 no-print">
        <TextArea
          label="Loan Offer A"
          value={loanOfferA}
          onChange={(e) => setLoanOfferA(e.target.value)}
          placeholder="Paste details for the first loan offer..."
          disabled={isLoading}
        />
        <TextArea
          label="Loan Offer B"
          value={loanOfferB}
          onChange={(e) => setLoanOfferB(e.target.value)}
          placeholder="Paste details for the second loan offer..."
          disabled={isLoading}
        />
      </div>

      <Button onClick={handleCompare} isLoading={isLoading} className="w-full no-print">
        {isLoading ? 'Comparing...' : 'Compare Loan Offers'}
      </Button>
      {error && <div className="mt-4 no-print"><Alert message={error} type="error" /></div>}

      {isLoading && <div className="mt-8"><Loader message="AI is comparing the offers..."/></div>}

      {result && (
        <div className="mt-8 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-brand-dark">Comparison Result</h3>
                 <div className="flex space-x-2 no-print">
                    <button onClick={handleShare} title="Share on WhatsApp" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.908 6.188l.29.443-1.182 4.324 4.463-1.168.418.243z"/></svg>
                    </button>
                    <button onClick={handlePrint} title="Download Summary (PDF)" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                </div>
            </div>
          
            <Card className="bg-green-50 border-l-8 border-brand-success">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-success" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h4 className="text-xl font-bold text-brand-dark">Recommended Choice: <span className="text-brand-success">{result.winner}</span></h4>
                        <blockquote className="mt-2 text-gray-700 italic">
                           "{result.reasoning}"
                        </blockquote>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="font-semibold text-green-800 text-center">
                        Potential Savings: <span className="font-bold text-lg">{result.costDifference}</span>
                    </p>
                </div>
            </Card>
          
          {result.cibilHealthAnalysis && (
            <Card>
                <h4 className="text-xl font-bold text-brand-dark mb-2">CIBIL Health Recommendation</h4>
                <p className="text-gray-700 mb-3">{result.cibilHealthAnalysis.recommendation}</p>
                 <div className="mt-4">
                    <h5 className="font-semibold text-sm text-gray-600 mb-1">Recommendation Confidence</h5>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-brand-secondary h-2.5 rounded-full" style={{width: `${result.cibilHealthAnalysis.confidenceScore}%`}}></div>
                    </div>
                    <p className="text-right text-xs font-bold text-brand-secondary">{result.cibilHealthAnalysis.confidenceScore}%</p>
                 </div>
            </Card>
          )}

          <div>
            <h4 className="text-xl font-bold text-brand-dark mb-2 text-center">Feature Comparison Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 rounded-l-lg">Feature</th>
                    <th scope="col" className="px-6 py-3">Offer A</th>
                    <th scope="col" className="px-6 py-3 rounded-r-lg">Offer B</th>
                  </tr>
                </thead>
                <tbody>
                  {result.featureMatrix.map((item, index) => (
                    <tr key={index} className="bg-white border-b">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.feature}</th>
                      <td className="px-6 py-4">{item.offerA}</td>
                      <td className="px-6 py-4">{item.offerB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};