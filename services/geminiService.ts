import type { LoanAnalysisResult, UserProfile, LoanComparisonResult, GovernmentScheme } from '../types';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Type declaration for Vite environment variables
declare global {
    interface ImportMeta {
        env: Record<string, string>;
    }
}

// Get API key from environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const ai = new GoogleGenerativeAI(apiKey);

const model = "gemini-2.5-flash";

// Helper function to safely parse JSON
const safeJsonParse = <T>(jsonString: string): T | null => {
    try {
        // The response might have markdown backticks, remove them.
        const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
        return JSON.parse(cleanedJsonString);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        console.error("Original string:", jsonString);
        return null;
    }
};

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // result is "data:mime/type;base64,the-real-base64-string"
            // we want to remove the prefix
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const analyzeLoanAgreement = async (loanText: string, userProfile: UserProfile, cibilReportFile: File | null): Promise<LoanAnalysisResult> => {
    
    const cibilInstruction = cibilReportFile 
        ? `Additionally, the user has uploaded their CIBIL report. Analyze it for a more detailed CIBIL impact prediction and provide a confidence score (0-100) for your prediction.`
        : ``;

    const prompt = `
        Perform a comprehensive analysis of the provided loan agreement text for a user in India with the following profile:
        - Loan Type: ${userProfile.loanType}
        - Loan Amount: ₹${userProfile.loanAmount}
        - Loan Tenure: ${userProfile.loanTenure}
        - Income Stability: ${userProfile.incomeStability}
        - Monthly Income: ${userProfile.monthlyIncome}
        - Existing EMIs: ${userProfile.existingEMIs}
        - CIBIL Score: ${userProfile.cibilScore}

        Loan Agreement Text:
        ---
        ${loanText}
        ---

        ${cibilInstruction}

        Provide a detailed, multi-faceted analysis covering the points below. All financial calculations should be based on the provided text, using the user's specified loan tenure of ${userProfile.loanTenure}. If a tenure is explicitly mentioned in the loan text, prioritize that over the user's input. IMPORTANT: The principal loan amount for all calculations is ₹${userProfile.loanAmount}.

        1.  **Extract Key Terms**: Identify interest rate, processing fee, prepayment penalty, late payment charges, and any mandatory insurance linkage. If a term is not mentioned, state "Not Mentioned".
        2.  **Calculate Loan Fit Score**: A score from 0-100 indicating how suitable this loan is.
        3.  **Total Cost Calculation**: Calculate the total amount payable, total interest, total fees (processing fee, etc.), and express the total interest as a percentage of the principal amount.
        4.  **Enhanced Affordability Warning**: Assess affordability against RBI guidelines (total EMIs should not exceed 40-50% of income). Provide a general 'reason' string for the overall affordability, and for each of the following, provide a main 'value' (a single currency amount) and a 'details' string explaining the calculation:
            - 'safeEMILimit': The user's safe EMI limit in INR. The details should explain how it's calculated from their income (e.g., "(Based on 40% of estimated ₹45,000 monthly income)").
            - 'monthlyBurden': The potential total monthly EMI burden including this new loan. The details should explain the components (e.g., "(New EMI + Estimated Existing EMIs)").
            - 'recommendedLoanAmount': A recommended optimal loan amount for their income. The details should explain the parameters used for this recommendation (e.g., "(If you wish to utilize your full safe EMI capacity of ₹14,400 per month after existing EMIs, for a 5-year tenure at 11.5% interest.)").
        5.  **Enhanced CIBIL Impact Prediction**: Provide a main prediction, then detail the specific score impact (e.g., "Potential drop of 5-10 points initially, then rise with timely payments"), warn about default risks, and offer advice for improving their credit profile with this loan.
        6.  **Market Comparison**: Compare the loan's interest rate with current standard rates from major Indian banks (like SBI, HDFC, ICICI). State the standard rate range, calculate potential total savings if they got a better rate, and list the recommended lenders.
        7.  **Government Scheme Comparison**: Based on the loan's purpose, identify relevant government-backed loan schemes (e.g., Mudra, PM SVANidhi). Provide a brief comparison, calculate potential savings with a government scheme, and list up to two schemes with their name, typical interest rate, and a direct link to the official government portal.
        8.  **Identify Red Flags**: List any predatory or unfavorable terms with a severity (High, Medium, Low).
        9.  **Action Plan**: Give a final, decisive verdict: 'DO NOT SIGN', 'Proceed with Caution', or 'Looks Good'. Provide a list of 2-3 clear, actionable next steps for the user.

        IMPORTANT: Return the entire analysis as a valid JSON object with the following structure:
        {
          "loanFitScore": number,
          "extractedTerms": {
            "interestRate": "string",
            "processingFee": "string", 
            "prepaymentPenalty": "string",
            "latePaymentCharges": "string",
            "insuranceLinkage": "string"
          },
          "redFlags": [{"severity": "High|Medium|Low", "indicator": "string", "details": "string"}],
          "totalCostAnalysis": {
            "totalPayable": "string",
            "totalInterest": "string", 
            "totalFees": "string",
            "interestPercentage": "string"
          },
          "enhancedAffordability": {
            "isAffordable": boolean,
            "reason": "string",
            "safeEMILimit": {"value": "string", "details": "string"},
            "monthlyBurden": {"value": "string", "details": "string"},
            "recommendedLoanAmount": {"value": "string", "details": "string"}
          },
          "detailedCibilImpact": {
            "predictionText": "string",
            "scoreImpact": "string",
            "defaultRiskWarning": "string", 
            "improvementAdvice": "string"
          },
          "marketRateComparison": {
            "comparisonText": "string",
            "potentialSavings": "string",
            "recommendedLenders": ["string"]
          },
          "governmentSchemeComparison": {
            "comparisonText": "string",
            "potentialSavings": "string",
            "schemes": [{"name": "string", "interestRate": "string", "portalLink": "string"}]
          },
          "actionPlan": {
            "finalVerdict": "DO NOT SIGN|Proceed with Caution|Looks Good",
            "nextSteps": ["string"]
          },
          "cibilImpactConfidenceScore": number
        }
    `;

    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: prompt }];
    if (cibilReportFile) {
        const base64Data = await fileToBase64(cibilReportFile);
        parts.push({
            inlineData: {
                mimeType: cibilReportFile.type,
                data: base64Data,
            },
        });
    }

    const genAI = ai.getGenerativeModel({ model });
    
    const response = await genAI.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
            temperature: 0.2,
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ],
    });

    const resultJson = response.response.text();
    const result = safeJsonParse<LoanAnalysisResult>(resultJson);
    
    if (!result) {
        throw new Error("Failed to get a valid analysis from the AI. The response format was incorrect.");
    }
    return result;
};

export const compareLoanOffers = async (offerA: string, offerB: string, userProfile: UserProfile, cibilReportFile: File | null): Promise<LoanComparisonResult> => {
     
    const cibilInstruction = cibilReportFile
        ? `Additionally, the user has uploaded their CIBIL report. Analyze it to provide a CIBIL Health Analysis, which includes a recommendation on which offer is better for their long-term credit health and a confidence score (0-100) for this recommendation.`
        : ``;
     
    const prompt = `
        Compare two loan offers for a user in India with the following profile:
        - Loan Type: ${userProfile.loanType}
        - Loan Amount: ₹${userProfile.loanAmount}
        - Loan Tenure: ${userProfile.loanTenure}
        - CIBIL Score: ${userProfile.cibilScore}
        - Monthly Income: ${userProfile.monthlyIncome}
        
        Loan Offer A:
        ---
        ${offerA}
        ---

        Loan Offer B:
        ---
        ${offerB}
        ---

        ${cibilInstruction}

        Provide a detailed comparison with winner, reasoning, cost difference, feature matrix, and CIBIL health analysis if applicable.
        
        IMPORTANT: Return the entire comparison as a valid JSON object with the following structure:
        {
          "winner": "Offer A" or "Offer B",
          "reasoning": "detailed explanation of why the winner is better",
          "costDifference": "total cost difference between offers",
          "featureMatrix": [
            {"feature": "Interest Rate", "offerA": "value", "offerB": "value"},
            {"feature": "Processing Fee", "offerA": "value", "offerB": "value"}
          ],
          "cibilHealthAnalysis": {
            "recommendation": "which offer is better for credit health",
            "confidenceScore": number (0-100)
          }
        }
    `;
    
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: prompt }];
    if (cibilReportFile) {
        const base64Data = await fileToBase64(cibilReportFile);
        parts.push({
            inlineData: {
                mimeType: cibilReportFile.type,
                data: base64Data,
            },
        });
    }

    const genAI = ai.getGenerativeModel({ model });
    
    const response = await genAI.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
            temperature: 0.2,
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ],
    });

    const resultJson = response.response.text();
    const result = safeJsonParse<LoanComparisonResult>(resultJson);
    
    if (!result) {
        throw new Error("Failed to get a valid comparison from the AI. The response format was incorrect.");
    }
    return result;
};

export const checkGovernmentSchemes = async (loanPurpose: string, loanAmount: number): Promise<GovernmentScheme[]> => {
    const prompt = `
        Find relevant Indian government-backed loan schemes for the following request:
        - Purpose of Loan: ${loanPurpose}
        - Loan Amount: ₹${loanAmount}
        
        Provide up to 5 relevant government schemes with details about their benefits, eligibility, and application process.
        
        IMPORTANT: Return the entire list as a valid JSON array with the following structure:
        [
          {
            "name": "scheme name",
            "description": "scheme description",
            "interestRateComparison": "how interest rate compares to market",
            "eligibility": ["criteria 1", "criteria 2"],
            "applicationGuidance": "how to apply"
          }
        ]
    `;
    
    const genAI = ai.getGenerativeModel({ model });
    
    const response = await genAI.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2,
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ],
    });

    const resultJson = response.response.text();
    const result = safeJsonParse<GovernmentScheme[]>(resultJson);

    if (result === null) {
        throw new Error("Failed to get a valid scheme list from the AI. The response format was incorrect.");
    }
    return result;
};