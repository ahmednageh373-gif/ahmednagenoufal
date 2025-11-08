/**
 * Library Loader Utility
 * Provides functions to dynamically load and wait for external libraries
 */

// Type definitions for library status
type LibraryId = 'xlsx' | 'pdfjs' | 'chartjs' | 'sortablejs' | 'gapi';

interface LibraryStatus {
    loaded: boolean;
    loading: boolean;
    error: Error | null;
}

// Track library status
const libraryStatus: Record<LibraryId, LibraryStatus> = {
    xlsx: { loaded: false, loading: false, error: null },
    pdfjs: { loaded: false, loading: false, error: null },
    chartjs: { loaded: false, loading: false, error: null },
    sortablejs: { loaded: false, loading: false, error: null },
    gapi: { loaded: false, loading: false, error: null },
};

/**
 * Check if a library is loaded
 * @param libraryId - ID of the library to check
 * @returns True if library is loaded
 */
export const isLibraryLoaded = (libraryId: LibraryId): boolean => {
    // Check window function first
    if (typeof window !== 'undefined' && (window as any).isLibraryLoaded) {
        return (window as any).isLibraryLoaded(libraryId);
    }
    
    // Fallback to checking global objects
    switch (libraryId) {
        case 'xlsx':
            return typeof (window as any).XLSX !== 'undefined';
        case 'pdfjs':
            return typeof (window as any).pdfjsLib !== 'undefined';
        case 'chartjs':
            return typeof (window as any).Chart !== 'undefined';
        case 'sortablejs':
            return typeof (window as any).Sortable !== 'undefined';
        case 'gapi':
            return typeof (window as any).gapi !== 'undefined';
        default:
            return false;
    }
};

/**
 * Wait for a library to be loaded
 * @param libraryId - ID of the library to wait for
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when library is loaded
 */
export const waitForLibrary = (libraryId: LibraryId, timeout = 10000): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (isLibraryLoaded(libraryId)) {
            libraryStatus[libraryId].loaded = true;
            resolve();
            return;
        }
        
        // Use window function if available
        if (typeof window !== 'undefined' && (window as any).waitForLibrary) {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout waiting for library: ${libraryId}`));
            }, timeout);
            
            (window as any).waitForLibrary(libraryId)
                .then(() => {
                    clearTimeout(timeoutId);
                    libraryStatus[libraryId].loaded = true;
                    resolve();
                })
                .catch((error: Error) => {
                    clearTimeout(timeoutId);
                    libraryStatus[libraryId].error = error;
                    reject(error);
                });
            return;
        }
        
        // Fallback: Poll for library
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (isLibraryLoaded(libraryId)) {
                clearInterval(checkInterval);
                libraryStatus[libraryId].loaded = true;
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                const error = new Error(`Timeout waiting for library: ${libraryId}`);
                libraryStatus[libraryId].error = error;
                reject(error);
            }
        }, 100);
    });
};

/**
 * Get the status of a library
 * @param libraryId - ID of the library
 * @returns Library status object
 */
export const getLibraryStatus = (libraryId: LibraryId): LibraryStatus => {
    return { ...libraryStatus[libraryId] };
};

/**
 * Wait for multiple libraries
 * @param libraryIds - Array of library IDs to wait for
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when all libraries are loaded
 */
export const waitForLibraries = (libraryIds: LibraryId[], timeout = 10000): Promise<void[]> => {
    return Promise.all(libraryIds.map(id => waitForLibrary(id, timeout)));
};

/**
 * Load a library with a visual loading indicator
 * @param libraryId - ID of the library to load
 * @param onProgress - Optional callback for progress updates
 * @returns Promise that resolves when library is loaded
 */
export const loadLibraryWithProgress = (
    libraryId: LibraryId,
    onProgress?: (message: string) => void
): Promise<void> => {
    const libraryNames: Record<LibraryId, string> = {
        xlsx: 'Excel Processing (XLSX)',
        pdfjs: 'PDF Viewer',
        chartjs: 'Charts',
        sortablejs: 'Drag & Drop',
        gapi: 'Google APIs',
    };
    
    const name = libraryNames[libraryId];
    
    if (isLibraryLoaded(libraryId)) {
        onProgress?.(`${name} already loaded ✓`);
        return Promise.resolve();
    }
    
    onProgress?.(`Loading ${name}...`);
    libraryStatus[libraryId].loading = true;
    
    return waitForLibrary(libraryId)
        .then(() => {
            libraryStatus[libraryId].loading = false;
            onProgress?.(`${name} loaded ✓`);
        })
        .catch((error) => {
            libraryStatus[libraryId].loading = false;
            libraryStatus[libraryId].error = error;
            onProgress?.(`Failed to load ${name} ✗`);
            throw error;
        });
};

/**
 * Preload a library by triggering its load
 * @param libraryId - ID of the library to preload
 */
export const preloadLibrary = (libraryId: LibraryId): void => {
    if (!isLibraryLoaded(libraryId) && !libraryStatus[libraryId].loading) {
        libraryStatus[libraryId].loading = true;
        waitForLibrary(libraryId, 30000)
            .then(() => {
                libraryStatus[libraryId].loading = false;
            })
            .catch((error) => {
                libraryStatus[libraryId].loading = false;
                libraryStatus[libraryId].error = error;
                console.warn(`Failed to preload library ${libraryId}:`, error);
            });
    }
};

/**
 * React hook for loading libraries
 * Usage: const { loaded, error } = useLibrary('xlsx');
 */
export const useLibrary = (libraryId: LibraryId) => {
    const [loaded, setLoaded] = React.useState(isLibraryLoaded(libraryId));
    const [error, setError] = React.useState<Error | null>(null);
    
    React.useEffect(() => {
        if (loaded) return;
        
        waitForLibrary(libraryId)
            .then(() => setLoaded(true))
            .catch(setError);
    }, [libraryId, loaded]);
    
    return { loaded, error };
};

// Export for TypeScript
import React from 'react';
