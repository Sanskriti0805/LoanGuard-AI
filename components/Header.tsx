import React from 'react';
import { APP_NAME, APP_TAGLINE } from '../constants';

interface HeaderProps {
    onFaqClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onFaqClick }) => {
  return (
    <header className="bg-brand-dark shadow-lg no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-primary p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
            <p className="text-sm text-gray-300 hidden sm:block">{APP_TAGLINE}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <button
                onClick={onFaqClick}
                className="bg-brand-secondary text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-500 transition-colors flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">FAQ</span>
            </button>
            <button
                className="bg-transparent border-2 border-brand-secondary text-brand-secondary font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary hover:text-white transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Login / Sign Up (Coming Soon)"
                disabled
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Login / Sign Up</span>
            </button>
        </div>
      </div>
    </header>
  );
};