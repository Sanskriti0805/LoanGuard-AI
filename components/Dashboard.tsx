import React from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface DashboardProps {
    cibilReportFile: File | null;
    setCibilReportFile: (file: File | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ cibilReportFile, setCibilReportFile }) => {

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCibilReportFile(event.target.files[0]);
    } else {
      setCibilReportFile(null);
    }
  };

  return (
    <Card>
      <h3 className="text-xl font-bold text-brand-dark mb-4">My Dashboard</h3>
      <p className="text-gray-600 mb-6">Manage your documents and account here for a more personalized analysis.</p>

      <div className="space-y-6">
        <Card className="bg-blue-50 border border-brand-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-brand-dark">Upload Your CIBIL Report</h4>
              <p className="text-gray-600 mt-1">For the most accurate CIBIL impact prediction and a more deeply personalized loan analysis, upload your latest CIBIL report (PDF). Our AI will analyze it locally in your browser to give you unparalleled insights.</p>
            </div>
            <div className="w-full md:w-auto">
              <label htmlFor="cibil-upload" className="w-full">
                <Button as="span" className="w-full cursor-pointer">
                  {cibilReportFile ? 'Change File' : 'Choose File'}
                </Button>
                <input
                  id="cibil-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          {cibilReportFile && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
              ✓ Successfully selected: <strong>{cibilReportFile.name}</strong>. This will be used in your next analysis.
            </div>
          )}
        </Card>
        
        <Card className="bg-gray-100 border border-gray-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div className="flex-1">
                <h4 className="text-xl font-bold text-brand-dark">Create an Account (Coming Soon)</h4>
                <p className="text-gray-600 mt-1">Sign up to save your analysis history, manage multiple loan documents, and track your financial health over time.</p>
            </div>
            <div className="w-full md:w-auto">
                <Button disabled={true} className="w-full">
                Sign Up Now
                </Button>
            </div>
            </div>
        </Card>
      </div>
    </Card>
  );
};