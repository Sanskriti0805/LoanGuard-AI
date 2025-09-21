import React from 'react';

// FIX: Add `as` prop to allow rendering as a span, making the component polymorphic.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  as?: 'span';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, as, ...props }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2";
  
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-blue-700 focus:ring-brand-primary',
    secondary: 'bg-brand-light text-brand-dark hover:bg-gray-300 focus:ring-brand-secondary',
  };

  // FIX: Merge passed className with component's own classes to avoid overriding.
  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${props.className || ''}`.trim();
  const { className, ...restProps } = props;

  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span>{children}</span>
    </>
  );

  if (as === 'span') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { disabled, type, ...spanProps } = restProps;
    return (
        <span className={finalClassName} {...spanProps}>
            {content}
        </span>
    );
  }

  return (
    <button className={finalClassName} disabled={isLoading || props.disabled} {...restProps}>
      {content}
    </button>
  );
};
