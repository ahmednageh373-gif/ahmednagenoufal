import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeConfig, ThemeMode, ColorScheme, FontSize } from '../types';

interface ThemeContextType {
    theme: ThemeConfig;
    updateTheme: (updates: Partial<ThemeConfig>) => void;
    resetTheme: () => void;
    applyTheme: (theme: ThemeConfig) => void;
}

const defaultTheme: ThemeConfig = {
    mode: 'light',
    colorScheme: 'default',
    fontSize: 'medium',
    borderRadius: 'medium',
    spacing: 'normal',
    animations: true,
    highContrast: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeConfig>(() => {
        try {
            const savedTheme = localStorage.getItem('AN_AI_THEME_CONFIG');
            if (savedTheme) {
                return { ...defaultTheme, ...JSON.parse(savedTheme) };
            }
        } catch (error) {
            console.error('Error loading theme from localStorage:', error);
        }
        return defaultTheme;
    });

    // Apply theme changes to document
    useEffect(() => {
        const root = document.documentElement;
        
        // Apply dark mode
        if (theme.mode === 'dark') {
            root.classList.add('dark');
        } else if (theme.mode === 'light') {
            root.classList.remove('dark');
        } else {
            // Auto mode - detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        // Apply font size
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px',
            'extra-large': '20px',
        };
        root.style.fontSize = fontSizeMap[theme.fontSize];

        // Apply color scheme via CSS variables
        const colorSchemes = {
            default: {
                primary: '99, 102, 241', // indigo-500
                primaryDark: '79, 70, 229', // indigo-600
                primaryLight: '165, 180, 252', // indigo-300
            },
            blue: {
                primary: '59, 130, 246', // blue-500
                primaryDark: '37, 99, 235', // blue-600
                primaryLight: '147, 197, 253', // blue-300
            },
            green: {
                primary: '34, 197, 94', // green-500
                primaryDark: '22, 163, 74', // green-600
                primaryLight: '134, 239, 172', // green-300
            },
            purple: {
                primary: '168, 85, 247', // purple-500
                primaryDark: '147, 51, 234', // purple-600
                primaryLight: '216, 180, 254', // purple-300
            },
            orange: {
                primary: '249, 115, 22', // orange-500
                primaryDark: '234, 88, 12', // orange-600
                primaryLight: '253, 186, 116', // orange-300
            },
            red: {
                primary: '239, 68, 68', // red-500
                primaryDark: '220, 38, 38', // red-600
                primaryLight: '252, 165, 165', // red-300
            },
            teal: {
                primary: '20, 184, 166', // teal-500
                primaryDark: '13, 148, 136', // teal-600
                primaryLight: '94, 234, 212', // teal-300
            },
            pink: {
                primary: '236, 72, 153', // pink-500
                primaryDark: '219, 39, 119', // pink-600
                primaryLight: '249, 168, 212', // pink-300
            },
        };

        const colors = colorSchemes[theme.colorScheme];
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-dark', colors.primaryDark);
        root.style.setProperty('--color-primary-light', colors.primaryLight);

        // Apply border radius
        const borderRadiusMap = {
            none: '0',
            small: '0.25rem',
            medium: '0.5rem',
            large: '1rem',
        };
        root.style.setProperty('--border-radius', borderRadiusMap[theme.borderRadius]);

        // Apply spacing
        const spacingMap = {
            compact: '0.75',
            normal: '1',
            comfortable: '1.5',
        };
        root.style.setProperty('--spacing-multiplier', spacingMap[theme.spacing]);

        // Apply animations
        if (!theme.animations) {
            root.style.setProperty('--transition-duration', '0s');
        } else {
            root.style.setProperty('--transition-duration', '0.2s');
        }

        // Apply high contrast
        if (theme.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Save to localStorage
        try {
            localStorage.setItem('AN_AI_THEME_CONFIG', JSON.stringify(theme));
        } catch (error) {
            console.error('Error saving theme to localStorage:', error);
        }
    }, [theme]);

    const updateTheme = (updates: Partial<ThemeConfig>) => {
        setTheme(prev => ({ ...prev, ...updates }));
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    const applyTheme = (newTheme: ThemeConfig) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
