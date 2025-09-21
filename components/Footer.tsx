import React from 'react';
import { APP_NAME } from '../constants';

interface FooterProps {
    onFaqClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onFaqClick }) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-brand-dark text-white pt-10 pb-6 mt-12 no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{APP_NAME}</h3>
            <p className="text-sm text-gray-400">
              Your AI-powered shield against predatory loans. We help you understand complex loan agreements, compare offers, and make financially sound decisions.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="text-sm">
              <li>
                <button 
                    onClick={onFaqClick} 
                    className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                    Frequently Asked Questions
                </button>
              </li>
              {/* Add other links here if needed in the future */}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Disclaimer</h3>
            <p className="text-xs text-gray-500">
              {APP_NAME} provides AI-generated analysis and should not be considered as financial advice. Always consult with a qualified financial advisor before making any loan decisions. The information provided is for educational purposes only.
            </p>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />
        
        <div className="text-center text-sm text-gray-400">
          <p>&copy; {currentYear} {APP_NAME}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
