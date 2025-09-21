import React, { useState } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-4 px-2"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-brand-dark">{question}</h3>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 text-gray-700 prose max-w-none">
          {children}
        </div>
      )}
    </div>
  );
};

interface FAQProps {
    onBack: () => void;
}

const FAQ_CATEGORIES = [
    {
        category: "Understanding Loan Basics",
        items: [
            {
                q: "What's the difference between a 'flat' and a 'reducing balance' interest rate?",
                a: `<p>This is one of the most crucial concepts to understand. A <strong>'reducing balance'</strong> rate is the fair and standard method where interest is calculated only on the outstanding loan amount, which decreases as you pay your EMIs. A <strong>'flat'</strong> rate is calculated on the initial loan amount for the entire tenure, ignoring your repayments. This means you pay interest on money you've already paid back. A 12% flat rate is effectively almost a 22-24% reducing balance rate. <strong>Always insist on the reducing balance rate.</strong></p>`
            },
            {
                q: "Is it better to take a shorter tenure with a higher EMI, or a longer tenure with a lower EMI?",
                a: `<p>It depends on your financial situation:</p>
                   <ul>
                    <li><strong>Shorter Tenure (Higher EMI):</strong> You pay off the loan faster and pay significantly less total interest. Choose this if you can comfortably afford the higher monthly payments.</li>
                    <li><strong>Longer Tenure (Lower EMI):</strong> Your monthly burden is lower, which can be easier on your budget. However, you will pay much more in total interest over the life of the loan.</li>
                   </ul>
                   <p>Generally, it's financially wiser to choose the shortest tenure you can comfortably manage.</p>`
            },
            {
                q: "What is a Pre-EMI?",
                a: "<p>Pre-EMI is the interest paid on a home loan before the full loan amount is disbursed. This usually happens with under-construction properties where the bank releases funds in stages. You only pay the interest on the amount disbursed so far, and your actual EMIs (Principal + Interest) begin only after you get possession and the full loan amount is paid out. During the Pre-EMI period, your principal amount does not reduce.</p>"
            }
        ]
    },
    {
        category: "CIBIL Score & Credit Health",
        items: [
            {
                q: "How does my CIBIL score affect my loan approval and interest rate?",
                a: "<p>Your CIBIL score is a summary of your credit history and is critical for lenders. A high score (750+) signals that you are a responsible borrower, leading to faster loan approvals, higher loan amounts, and, most importantly, <strong>lower interest rates</strong>. A low score (below 650) can lead to outright rejection or approval but with a very high interest rate to cover the lender's perceived risk.</p>"
            },
            {
                q: "Will applying to many banks for a loan hurt my CIBIL score?",
                a: "<p>Yes. Every time you apply for a loan, the lender performs a 'hard inquiry' on your CIBIL report. Multiple hard inquiries in a short period can lower your score by a few points. It signals to lenders that you might be 'credit hungry' or facing financial distress. It's best to research interest rates online and then apply to 2-3 lenders where you have a high chance of approval.</p>"
            },
            {
                q: "How can I improve my CIBIL score?",
                a: `<ul>
                    <li><strong>Pay all your bills on time:</strong> This is the single most important factor. Set up auto-debits for your EMIs and credit card bills.</li>
                    <li><strong>Keep credit card balances low:</strong> Try to use less than 30% of your available credit limit.</li>
                    <li><strong>Maintain a healthy credit mix:</strong> A mix of secured loans (like home or auto) and unsecured loans (like personal loans or credit cards) is viewed positively.</li>
                    <li><strong>Review your credit report regularly:</strong> Check for errors in your report and get them rectified immediately.</li>
                    <li><strong>Don't close old credit cards:</strong> A longer credit history is beneficial.</li>
                   </ul>`
            }
        ]
    },
    {
        category: "Charges, Fees & Hidden Costs",
        items: [
            {
                q: "What are the common hidden charges I should look out for?",
                a: `<ul>
                    <li><strong>Processing Fee:</strong> A one-time fee, typically 1-3%. Be wary of anything higher.</li>
                    <li><strong>Prepayment/Foreclosure Charges:</strong> A penalty for paying off your loan early. RBI has removed these for floating-rate home loans, but they exist for other loans.</li>
                    <li><strong>Late Payment Fees:</strong> A significant penalty for missing your EMI due date.</li>
                    <li><strong>Insurance Premiums:</strong> Lenders often bundle a life or health insurance policy with the loan, which adds to your cost. This is often not mandatory.</li>
                    <li><strong>Documentation/Stamp Duty Charges:</strong> Fees for legal paperwork.</li>
                   </ul>`
            },
            {
                q: "What is a Processing Fee and can it be negotiated?",
                a: "<p>A processing fee is a charge for the administrative work involved in processing your loan application. It's usually a percentage of the loan amount. Yes, it can often be negotiated, especially if you have a high CIBIL score and a good relationship with the bank. Don't hesitate to ask for a reduction or a complete waiver.</p>"
            }
        ]
    },
    {
        category: "The Application & Approval Process",
        items: [
            {
                q: "How much loan can I get based on my salary?",
                a: "<p>Lenders use the 'EMI to Income Ratio'. Generally, they prefer that your total monthly EMIs (including the new loan) do not exceed 40-50% of your take-home monthly salary. For example, if your take-home pay is ₹50,000, lenders would be comfortable if your total EMIs are around ₹20,000 - ₹25,000. They will calculate the maximum loan amount you can get based on this EMI affordability.</p>"
            },
            {
                q: "What does 'loan sanctioned' vs. 'loan disbursed' mean?",
                a: "<p><strong>'Loan Sanctioned'</strong> means the lender has approved your loan application in principle, based on your eligibility. They will issue a sanction letter mentioning the loan amount, tenure, and interest rate. This is not a final guarantee. <strong>'Loan Disbursed'</strong> means the final agreement has been signed, all documents are verified, and the lender has transferred the money to your bank account.</p>"
            }
        ]
    },
    {
        category: "Glossary of Common Loan Terms",
        items: [
            {
                q: "EMI (Equated Monthly Instalment)",
                a: "<p>The fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is paid off in full.</p>"
            },
            {
                q: "CIBIL Score",
                a: "<p>A three-digit numeric summary of your credit history, ranging from 300 to 900. It is a crucial factor for lenders in determining your creditworthiness. A higher score indicates a better credit history and can lead to better loan terms.</p>"
            },
            {
                q: "APR (Annual Percentage Rate)",
                a: "<p>The total cost of borrowing a loan over a year, expressed as a percentage. It includes the interest rate and all other mandatory fees (like processing fees). APR gives you a more complete picture of the loan's cost than the interest rate alone.</p>"
            },
            {
                q: "Processing Fee",
                a: "<p>A one-time charge levied by the lender to cover the administrative costs of processing your loan application. It is typically a percentage of the loan amount and is usually non-refundable.</p>"
            },
            {
                q: "Prepayment Penalty",
                a: "<p>A fee that lenders may charge if you pay off all or part of your loan before the scheduled end of the term. This fee compensates the lender for the loss of interest they would have otherwise earned. Note: The RBI has disallowed prepayment penalties on floating rate home loans.</p>"
            }
        ]
    }
];


export const FAQ: React.FC<FAQProps> = ({ onBack }) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-brand-dark">Frequently Asked Questions</h2>
        <Button onClick={onBack} variant="secondary">
          &larr; Back to App
        </Button>
      </div>
      
      <div className="space-y-6">
        {FAQ_CATEGORIES.map(category => (
            <div key={category.category}>
                <h2 className="text-xl font-bold text-brand-primary mb-2 pb-2 border-b-2 border-brand-primary/20">{category.category}</h2>
                <div className="space-y-2">
                    {category.items.map((item, index) => (
                        <FAQItem key={index} question={item.q}>
                            <div dangerouslySetInnerHTML={{ __html: item.a }} />
                        </FAQItem>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </Card>
  );
};