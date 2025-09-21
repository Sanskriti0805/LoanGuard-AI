import React from 'react';
import { Card } from './common/Card';
import { Select } from './common/Select';
import { TextInput } from './common/TextInput';
import { UserProfile } from '../types';
import { LOAN_TYPES, LOAN_TENURE_OPTIONS, INCOME_STABILITY_OPTIONS, MONTHLY_INCOME_OPTIONS, EXISTING_EMI_OPTIONS, CIBIL_SCORE_OPTIONS } from '../constants';

interface UserProfileFormProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ userProfile, setUserProfile }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumberInput = e.target.getAttribute('type') === 'number';

    setUserProfile({
      ...userProfile,
      [name]: isNumberInput ? parseFloat(value) || 0 : value,
    });
  };

  return (
    <Card className="no-print">
      <h3 className="text-xl font-bold text-brand-dark mb-4">Your Financial Profile</h3>
      <p className="text-gray-600 mb-6">Provide your details for a personalized loan analysis. This information stays in your browser and is not stored.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Select
          label="Loan Type You're Considering"
          name="loanType"
          value={userProfile.loanType}
          onChange={handleChange}
          options={LOAN_TYPES}
        />
        <TextInput
          label="Loan Amount (₹)"
          name="loanAmount"
          type="number"
          value={userProfile.loanAmount}
          onChange={handleChange}
          placeholder="e.g., 500000"
        />
        <Select
          label="Loan Tenure"
          name="loanTenure"
          value={userProfile.loanTenure}
          onChange={handleChange}
          options={LOAN_TENURE_OPTIONS}
        />
        <Select
          label="Income Stability"
          name="incomeStability"
          value={userProfile.incomeStability}
          onChange={handleChange}
          options={INCOME_STABILITY_OPTIONS}
        />
        <Select
          label="Monthly Take-Home Income"
          name="monthlyIncome"
          value={userProfile.monthlyIncome}
          onChange={handleChange}
          options={MONTHLY_INCOME_OPTIONS}
        />
        <Select
          label="Existing EMIs (as % of income)"
          name="existingEMIs"
          value={userProfile.existingEMIs}
          onChange={handleChange}
          options={EXISTING_EMI_OPTIONS}
        />
        <Select
          label="Your CIBIL Score"
          name="cibilScore"
          value={userProfile.cibilScore}
          onChange={handleChange}
          options={CIBIL_SCORE_OPTIONS}
        />
      </div>
    </Card>
  );
};