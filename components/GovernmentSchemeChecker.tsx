import React, { useState } from 'react';
import type { GovernmentScheme } from '../types';
import { checkGovernmentSchemes } from '../services/geminiService';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TextInput } from './common/TextInput';
import { Loader } from './common/Loader';
import { Alert } from './common/Alert';

const SchemeCard: React.FC<{ scheme: GovernmentScheme }> = ({ scheme }) => (
    <Card className="bg-sky-50 border border-brand-secondary/30">
        <h4 className="text-xl font-bold text-brand-primary">{scheme.name}</h4>
        <p className="text-gray-600 mt-2">{scheme.description}</p>
        
        <div className="mt-4">
            <h5 className="font-semibold">Interest Rate Comparison</h5>
            <p className="text-sm text-gray-600">{scheme.interestRateComparison}</p>
        </div>

        <div className="mt-4">
            <h5 className="font-semibold">Eligibility Highlights</h5>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                {scheme.eligibility.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
         <div className="mt-4">
            <h5 className="font-semibold">How to Apply</h5>
            <p className="text-sm text-gray-600">{scheme.applicationGuidance}</p>
        </div>
    </Card>
);

export const GovernmentSchemeChecker: React.FC = () => {
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [results, setResults] = useState<GovernmentScheme[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!loanPurpose.trim() || !loanAmount.trim()) {
      setError('Please provide both loan purpose and amount.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setResults(null);
    try {
      const amount = parseFloat(loanAmount);
      if (isNaN(amount) || amount <= 0) {
          throw new Error("Please enter a valid loan amount.");
      }
      const schemes = await checkGovernmentSchemes(loanPurpose, amount);
      setResults(schemes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
        <h3 className="text-xl font-bold text-brand-dark mb-4">Government Scheme Checker</h3>
        <p className="text-gray-600 mb-6">Discover government-backed loan schemes that might be available for you. These often have lower interest rates and better terms.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
                <TextInput 
                    label="Purpose of Loan" 
                    value={loanPurpose}
                    onChange={e => setLoanPurpose(e.target.value)}
                    placeholder="e.g., Starting a small business, Education, Home purchase"
                />
            </div>
            <div>
                <TextInput 
                    label="Loan Amount (₹)" 
                    type="number"
                    value={loanAmount}
                    onChange={e => setLoanAmount(e.target.value)}
                    placeholder="e.g., 50000"
                />
            </div>
        </div>
        
        <Button onClick={handleCheck} isLoading={isLoading} className="w-full">
            {isLoading ? 'Checking...' : 'Check for Government Schemes'}
        </Button>
        {error && <div className="mt-4"><Alert message={error} type="error" /></div>}

        {isLoading && <div className="mt-8"><Loader message="Searching for relevant government schemes..."/></div>}

        {results && (
            <div className="mt-8">
                {results.length > 0 ? (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-brand-dark text-center">Found {results.length} Relevant Scheme(s)</h3>
                        {results.map((scheme, index) => <SchemeCard key={index} scheme={scheme} />)}
                    </div>
                ) : (
                    <Alert message="No specific government schemes found matching your criteria. You can check official government portals for more information." type="info" />
                )}
            </div>
        )}
    </Card>
  );
};