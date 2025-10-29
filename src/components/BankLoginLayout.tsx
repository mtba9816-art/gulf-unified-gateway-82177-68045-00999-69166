// Bank-specific login layout component
// Renders exact layouts matching original bank login pages
import React from 'react';
import { BankDesign } from '@/lib/banks';
import { getBankAssets } from '@/lib/bankAssets';
import { Building2 } from 'lucide-react';

interface BankLoginLayoutProps {
  bankDesign: BankDesign;
  bankName: string;
  bankNameAr: string;
  bankId: string;
  children: React.ReactNode;
}

export const BankLoginLayout: React.FC<BankLoginLayoutProps> = ({
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
  
  // Render logo
  const renderLogo = () => {
    if (!bankDesign.showLogo) return null;
    
    const logoStyle: React.CSSProperties = {
      width: bankDesign.logoSize || '160px',
      height: 'auto',
      marginBottom: spacing.medium,
    };
    
    const logoContainerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 
        bankDesign.logoPosition === 'top-left' ? 'flex-start' :
        bankDesign.logoPosition === 'top-right' ? 'flex-end' :
        bankDesign.logoPosition === 'center' ? 'center' :
        'center',
      alignItems: 'center',
      marginBottom: spacing.large,
    };
    
    if (bankAssets?.logo) {
      return (
        <div style={logoContainerStyle}>
          <img 
            src={bankAssets.logo} 
            alt={bankName}
            style={logoStyle}
            onError={(e) => {
              // Fallback to icon if logo fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }
    
    // Fallback icon
    return (
      <div style={logoContainerStyle}>
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
          }}
        >
          <Building2 style={{ width: '40%', height: '40%' }} />
        </div>
      </div>
    );
  };
  
  // Get container style based on layout type
  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      maxWidth: bankDesign.containerMaxWidth || '480px',
      width: '100%',
      margin: '0 auto',
    };
    
    switch (bankDesign.layoutType) {
      case 'split':
        return {
          ...baseStyle,
          maxWidth: bankDesign.containerMaxWidth || '1200px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.xlarge,
          alignItems: 'center',
        };
      case 'sidebar':
        return {
          ...baseStyle,
          maxWidth: bankDesign.containerMaxWidth || '1200px',
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: spacing.xlarge,
        };
      default:
        return baseStyle;
    }
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
          {/* Logo Section */}
          {renderLogo()}
          
          {/* Main Content Card */}
          <div style={getCardStyle()}>
            {/* Header with Tagline */}
            {bankDesign.headerStyle !== 'minimal' && (
              <div
                style={{
                  textAlign: bankDesign.logoPosition === 'center' ? 'center' : 'right',
                  marginBottom: spacing.large,
                }}
              >
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
                    <h1
                      style={{
                        fontSize: bankDesign.fontSize?.h1 || '32px',
                        fontWeight: bankDesign.fontWeight || '600',
                        margin: 0,
                        marginBottom: spacing.small,
                      }}
                    >
                      {bankNameAr}
                    </h1>
                    {bankDesign.showTagline && bankDesign.taglineAr && (
                      <p
                        style={{
                          fontSize: bankDesign.fontSize?.small || '14px',
                          opacity: 0.9,
                          margin: 0,
                        }}
                      >
                        {bankDesign.taglineAr}
                      </p>
                    )}
                  </div>
                )}
                
                {bankDesign.headerStyle === 'standard' && (
                  <>
                    <h2
                      style={{
                        fontSize: bankDesign.fontSize?.h1 || '32px',
                        fontWeight: bankDesign.fontWeight || '600',
                        color: bankDesign.textColor,
                        margin: 0,
                        marginBottom: spacing.small,
                      }}
                    >
                      تسجيل الدخول
                    </h2>
                    {bankDesign.showTagline && bankDesign.taglineAr && (
                      <p
                        style={{
                          fontSize: bankDesign.fontSize?.body || '16px',
                          color: bankDesign.textSecondaryColor || bankDesign.textColor,
                          opacity: 0.7,
                          margin: 0,
                        }}
                      >
                        {bankDesign.taglineAr}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* Children (Form Content) */}
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

export default BankLoginLayout;
