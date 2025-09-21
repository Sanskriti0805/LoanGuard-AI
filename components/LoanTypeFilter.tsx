import React from 'react';

export type Tool = 'analyzer' | 'comparator' | 'schemes' | 'dashboard';

interface LoanTypeFilterProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}

const TOOLS: { id: Tool; name: string; description: string }[] = [
  { id: 'analyzer', name: 'Loan Safety Analyzer', description: 'Check a single loan for red flags' },
  { id: 'comparator', name: 'Loan Comparison Engine', description: 'Compare two loan offers side-by-side' },
  { id: 'schemes', name: 'Govt. Scheme Checker', description: 'Find relevant government schemes' },
  { id: 'dashboard', name: 'My Dashboard', description: 'Manage your profile and documents' }
];

export const LoanTypeFilter: React.FC<LoanTypeFilterProps> = ({ selectedTool, setSelectedTool }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 no-print">
      <div className="flex flex-col sm:flex-row justify-around items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`w-full flex flex-col justify-center text-center px-4 py-4 rounded-lg transition-colors duration-200 ${
              selectedTool === tool.id
                ? 'bg-brand-primary text-white shadow-lg'
                : 'bg-gray-100 text-brand-dark hover:bg-brand-light'
            }`}
          >
            <span className="font-semibold">{tool.name}</span>
            <span className="hidden md:block text-xs">{tool.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};