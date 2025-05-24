export const theme = {
  colors: {
    primary: '#0050ff', // Blue color used for primary actions
    primaryLight: '#e6edff', // Light blue for backgrounds and hover states
    secondary: '#6c757d', // Secondary/gray color
    success: '#10b981', // Green for success states
    warning: '#f59e0b', // Amber for warning states
    danger: '#ef4444', // Red for error states
    info: '#3b82f6', // Blue for info states
    
    // Background colors
    background: '#ffffff',
    backgroundAlt: '#f9fafb',
    backgroundMuted: '#f1f5f9',
    
    // Text colors
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#6b7280',
    textDisabled: '#9ca3af',
    
    // Border colors
    border: '#e5e7eb',
    borderHover: '#d1d5db',
    
    // Status colors for labels/tags
    inProgress: '#3b82f6', // Blue
    done: '#10b981',      // Green
    todo: '#6b7280',      // Gray
    
    // Team/Project colors (used in the sidebar indicators)
    engineering: '#3b82f6', // Blue
    design: '#8b5cf6',      // Purple
    marketing: '#ef4444',   // Red
    product: '#f59e0b',     // Amber
  },
  
  fontFamily: {
    // The screenshot shows a clean sans-serif font, likely DM Sans
    body: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  
  spacing: {
    // Spacing scale in pixels
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }
};