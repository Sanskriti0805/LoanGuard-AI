import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UserProfileForm } from './components/UserProfileForm';
import { LoanSafetyAnalyzer } from './components/LoanSafetyAnalyzer';
import { LoanComparisonEngine } from './components/LoanComparisonEngine';
import { GovernmentSchemeChecker } from './components/GovernmentSchemeChecker';
import { LoanTypeFilter, Tool } from './components/LoanTypeFilter';
import { Dashboard } from './components/Dashboard';
import { FAQ } from './components/FAQ';
import { UserProfile, LoanType, LoanTenure, IncomeStability, MonthlyIncome, ExistingEMIs, CIBILScore } from './types';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    loanType: LoanType.Personal,
    loanAmount: 500000,
    loanTenure: LoanTenure.FiveYears,
    incomeStability: IncomeStability.Salaried,
    monthlyIncome: MonthlyIncome.From30kTo75k,
    existingEMIs: ExistingEMIs.LessThan10,
    cibilScore: CIBILScore.Good,
  });
  
  const [cibilReportFile, setCibilReportFile] = useState<File | null>(null);

  type View = 'app' | 'faq';
  const [currentView, setCurrentView] = useState<View>('app');
  const [selectedTool, setSelectedTool] = useState<Tool>('analyzer');

  const renderTool = () => {
    switch (selectedTool) {
      case 'analyzer':
        return <LoanSafetyAnalyzer userProfile={userProfile} cibilReportFile={cibilReportFile} />;
      case 'comparator':
        return <LoanComparisonEngine userProfile={userProfile} cibilReportFile={cibilReportFile} />;
      case 'schemes':
        return <GovernmentSchemeChecker />;
      case 'dashboard':
        return <Dashboard cibilReportFile={cibilReportFile} setCibilReportFile={setCibilReportFile} />;
      default:
        return <LoanSafetyAnalyzer userProfile={userProfile} cibilReportFile={cibilReportFile} />;
    }
  };

  if (currentView === 'faq') {
      return (
          <div className="min-h-screen bg-brand-background flex flex-col">
              <Header onFaqClick={() => setCurrentView('app')} />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <FAQ onBack={() => setCurrentView('app')} />
              </main>
              <Footer onFaqClick={() => setCurrentView('faq')} />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col font-sans">
      <Header onFaqClick={() => setCurrentView('faq')} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <UserProfileForm userProfile={userProfile} setUserProfile={setUserProfile} />
          <LoanTypeFilter selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
          {renderTool()}
        </div>
      </main>
      <Footer onFaqClick={() => setCurrentView('faq')} />
      <div id="print-area" className="hidden print-only"></div>
    </div>
  );
}

export default App;