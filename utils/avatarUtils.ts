/**
 * Avatar Utility Functions
 * Provides utilities for generating and managing user avatars
 */

/**
 * Get initials from a name
 * @param name - Full name of the person
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
    if (!name) return '??';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Generate a consistent color based on a string (name)
 * @param str - Input string (usually a name)
 * @returns Hex color code
 */
export const generateColorFromString = (str: string): string => {
    if (!str) return '#6366f1'; // Default indigo
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate vibrant colors with good contrast
    const colors = [
        '#ef4444', // red-500
        '#f97316', // orange-500
        '#f59e0b', // amber-500
        '#eab308', // yellow-500
        '#84cc16', // lime-500
        '#22c55e', // green-500
        '#10b981', // emerald-500
        '#14b8a6', // teal-500
        '#06b6d4', // cyan-500
        '#0ea5e9', // sky-500
        '#3b82f6', // blue-500
        '#6366f1', // indigo-500
        '#8b5cf6', // violet-500
        '#a855f7', // purple-500
        '#d946ef', // fuchsia-500
        '#ec4899', // pink-500
        '#f43f5e', // rose-500
    ];
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

/**
 * Get contrasting text color (black or white) based on background color
 * @param hexColor - Background color in hex format
 * @returns 'black' or 'white'
 */
export const getContrastColor = (hexColor: string): 'black' | 'white' => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? 'black' : 'white';
};

/**
 * Generate avatar properties for a member
 * @param name - Member's name
 * @param customColor - Optional custom color
 * @returns Object with initials, color, and text color
 */
export const generateAvatarProps = (name: string, customColor?: string) => {
    const initials = getInitials(name);
    const backgroundColor = customColor || generateColorFromString(name);
    const textColor = getContrastColor(backgroundColor);
    
    return {
        initials,
        backgroundColor,
        textColor,
    };
};

/**
 * Create a data URI for an avatar SVG
 * @param name - Member's name
 * @param customColor - Optional custom color
 * @returns Data URI string
 */
export const generateAvatarDataURI = (name: string, customColor?: string): string => {
    const { initials, backgroundColor, textColor } = generateAvatarProps(name, customColor);
    
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <rect width="100" height="100" fill="${backgroundColor}"/>
            <text 
                x="50" 
                y="50" 
                font-family="Arial, sans-serif" 
                font-size="40" 
                font-weight="bold" 
                fill="${textColor}" 
                text-anchor="middle" 
                dominant-baseline="central"
            >
                ${initials}
            </text>
        </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Get role badge color
 * @param role - Member's role
 * @returns Tailwind color class
 */
export const getRoleBadgeColor = (role: string): string => {
    const roleColors: Record<string, string> = {
        'Admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        'Project Manager': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        'Engineer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'Architect': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        'Contractor': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        'Consultant': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'Viewer': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    
    return roleColors[role] || roleColors['Viewer'];
};

/**
 * Format member name for display
 * @param name - Full name
 * @param maxLength - Maximum length before truncating
 * @returns Formatted name
 */
export const formatMemberName = (name: string, maxLength: number = 20): string => {
    if (!name) return 'Unknown';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
};
