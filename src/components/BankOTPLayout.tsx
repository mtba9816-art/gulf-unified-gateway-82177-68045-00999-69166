// Bank-specific OTP layout component
// Renders exact layouts matching original bank OTP verification pages
import React from 'react';
import { BankDesign } from '@/lib/banks';
import { getBankAssets } from '@/lib/bankAssets';
import { Shield } from 'lucide-react';

interface BankOTPLayoutProps {
  bankDesign: BankDesign;
  bankName: string;
  bankNameAr: string;
  bankId: string;
  children: React.ReactNode;
}

export const BankOTPLayout: React.FC<BankOTPLayoutProps> = ({
  bankDesign,
  bankName,
  bankNameAr,
  bankId,
  children,
}) => {
  const bankAssets = getBankAssets(bankId);
  const spacing = bankDesign.spacing || { small: '8px', medium: '16px', large: '24px', xlarge: '32px' };
  
  // Get background style based on pattern
  const getBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: bankDesign.backgroundColor,
      minHeight: '100vh',
      direction: 'rtl',
      fontFamily: bankDesign.fontFamilyArabic || bankDesign.fontFamily || 'Tajawal, sans-serif',
      color: bankDesign.textColor,
    };
    
    switch (bankDesign.backgroundPattern) {
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${bankDesign.backgroundColor} 0%, ${bankDesign.surfaceColor} 100%)`,
        };
      case 'mesh':
        return {
          ...baseStyle,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${bankDesign.primaryColor}08 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, ${bankDesign.secondaryColor}08 0%, transparent 50%)`,
        };
      default:
        return baseStyle;
    }
  };
  
  // Get container style
  const getContainerStyle = (): React.CSSProperties => {
    return {
      maxWidth: bankDesign.containerMaxWidth || '480px',
      width: '100%',
      margin: '0 auto',
    };
  };
  
  // Get card style
  const getCardStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: bankDesign.surfaceColor,
      borderRadius: bankDesign.borderRadius || '12px',
      padding: bankDesign.padding?.card || '32px',
      width: '100%',
    };
    
    switch (bankDesign.cardStyle) {
      case 'elevated':
        return {
          ...baseStyle,
          boxShadow: bankDesign.shadow?.card || '0 4px 16px rgba(0, 0, 0, 0.1)',
        };
      case 'flat':
        return {
          ...baseStyle,
          boxShadow: 'none',
          border: `1px solid ${bankDesign.borderColor || bankDesign.primaryColor + '20'}`,
        };
      case 'outlined':
        return {
          ...baseStyle,
          border: `2px solid ${bankDesign.borderColor || bankDesign.primaryColor}`,
          boxShadow: 'none',
        };
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${bankDesign.surfaceColor} 0%, ${bankDesign.backgroundColor} 100%)`,
          boxShadow: bankDesign.shadow?.card || '0 4px 16px rgba(0, 0, 0, 0.1)',
        };
      default:
        return baseStyle;
    }
  };
  
  return (
    <div style={getBackgroundStyle()}>
      {/* Background Image/Pattern */}
      {bankDesign.backgroundImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${bankDesign.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.03,
            zIndex: 0,
          }}
        />
      )}
      
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          padding: bankDesign.padding?.container || '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={getContainerStyle()}>
          {/* Bank Header */}
          {bankDesign.showLogo && bankDesign.headerStyle !== 'minimal' && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: spacing.large,
              }}
            >
              {bankAssets?.logo ? (
                <img 
                  src={bankAssets.logo} 
                  alt={bankName}
                  style={{
                    width: bankDesign.logoSize || '160px',
                    height: 'auto',
                    marginBottom: spacing.medium,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: bankDesign.logoSize || '160px',
                    height: bankDesign.logoSize || '160px',
                    borderRadius: bankDesign.buttonRadius || '8px',
                    background: bankDesign.buttonStyle === 'gradient'
                      ? `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`
                      : bankDesign.primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    margin: '0 auto',
                    marginBottom: spacing.medium,
                  }}
                >
                  <Shield style={{ width: '40%', height: '40%' }} />
                </div>
              )}
              
              {bankDesign.headerStyle === 'prominent' && (
                <div
                  style={{
                    background: bankDesign.buttonStyle === 'gradient'
                      ? `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`
                      : bankDesign.primaryColor,
                    borderRadius: bankDesign.borderRadius || '12px',
                    padding: spacing.medium,
                    color: '#FFFFFF',
                    marginBottom: spacing.medium,
                  }}
                >
                  <h1 style={{ 
                    fontSize: bankDesign.fontSize?.h2 || '24px', 
                    fontWeight: bankDesign.fontWeight || '600', 
                    margin: 0,
                    marginBottom: spacing.small,
                  }}>
                    {bankNameAr}
                  </h1>
                  {bankDesign.showTagline && bankDesign.taglineAr && (
                    <p style={{ 
                      fontSize: bankDesign.fontSize?.small || '14px', 
                      opacity: 0.9, 
                      margin: 0,
                    }}>
                      {bankDesign.taglineAr}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* OTP Card */}
          <div style={getCardStyle()}>
            {children}
          </div>
        </div>
      </div>
      
      {/* Custom CSS if provided */}
      {bankDesign.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: bankDesign.customCSS }} />
      )}
    </div>
  );
};

// Fix: Add selectedBank parameter
interface BankOTPLayoutPropsFixed extends BankOTPLayoutProps {
  selectedBank?: { name: string; nameAr: string } | null;
}

export default BankOTPLayout;
