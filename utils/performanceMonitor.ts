/**
 * Performance Monitoring Utility
 * Monitors and reports web performance metrics
 */

interface PerformanceMetrics {
    fcp?: number;      // First Contentful Paint
    lcp?: number;      // Largest Contentful Paint
    fid?: number;      // First Input Delay
    cls?: number;      // Cumulative Layout Shift
    ttfb?: number;     // Time to First Byte
    domLoad?: number;  // DOM Content Loaded
    pageLoad?: number; // Full Page Load
}

let metricsReported = false;
const metrics: PerformanceMetrics = {};

/**
 * Get Web Vitals metrics
 */
export const getWebVitals = (): PerformanceMetrics => {
    return { ...metrics };
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = (): void => {
    if (typeof window === 'undefined' || !window.performance) {
        return;
    }

    // Measure TTFB
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
        metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
        metrics.domLoad = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
        metrics.pageLoad = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
    }

    // Measure FCP
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
    }

    // Measure LCP using PerformanceObserver
    if ('PerformanceObserver' in window) {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;
                metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Measure FID
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    metrics.fid = entry.processingStart - entry.startTime;
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Measure CLS
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries() as any[]) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        metrics.cls = clsValue;
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('PerformanceObserver not fully supported:', error);
        }
    }

    // Report metrics after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            reportMetrics();
        }, 3000); // Wait 3 seconds after load
    });
};

/**
 * Report performance metrics to console (can be extended to send to analytics)
 */
const reportMetrics = (): void => {
    if (metricsReported) return;
    metricsReported = true;

    console.group('📊 Performance Metrics');
    
    if (metrics.fcp) {
        const fcpStatus = metrics.fcp < 1800 ? '✅' : metrics.fcp < 3000 ? '⚠️' : '❌';
        console.log(`${fcpStatus} FCP (First Contentful Paint): ${metrics.fcp.toFixed(0)}ms`);
    }
    
    if (metrics.lcp) {
        const lcpStatus = metrics.lcp < 2500 ? '✅' : metrics.lcp < 4000 ? '⚠️' : '❌';
        console.log(`${lcpStatus} LCP (Largest Contentful Paint): ${metrics.lcp.toFixed(0)}ms`);
    }
    
    if (metrics.fid) {
        const fidStatus = metrics.fid < 100 ? '✅' : metrics.fid < 300 ? '⚠️' : '❌';
        console.log(`${fidStatus} FID (First Input Delay): ${metrics.fid.toFixed(0)}ms`);
    }
    
    if (metrics.cls !== undefined) {
        const clsStatus = metrics.cls < 0.1 ? '✅' : metrics.cls < 0.25 ? '⚠️' : '❌';
        console.log(`${clsStatus} CLS (Cumulative Layout Shift): ${metrics.cls.toFixed(3)}`);
    }
    
    if (metrics.ttfb) {
        const ttfbStatus = metrics.ttfb < 600 ? '✅' : metrics.ttfb < 1500 ? '⚠️' : '❌';
        console.log(`${ttfbStatus} TTFB (Time to First Byte): ${metrics.ttfb.toFixed(0)}ms`);
    }
    
    if (metrics.domLoad) {
        console.log(`📄 DOM Content Loaded: ${metrics.domLoad.toFixed(0)}ms`);
    }
    
    if (metrics.pageLoad) {
        console.log(`🎉 Full Page Load: ${metrics.pageLoad.toFixed(0)}ms`);
    }
    
    console.groupEnd();

    // Log recommendations
    const hasIssues = (metrics.lcp && metrics.lcp > 4000) || 
                      (metrics.fcp && metrics.fcp > 3000) || 
                      (metrics.cls && metrics.cls > 0.25);
    
    if (hasIssues) {
        console.group('💡 Performance Recommendations');
        if (metrics.lcp && metrics.lcp > 4000) {
            console.log('- LCP is slow. Consider optimizing images and deferring non-critical resources.');
        }
        if (metrics.fcp && metrics.fcp > 3000) {
            console.log('- FCP is slow. Minimize render-blocking resources and reduce server response times.');
        }
        if (metrics.cls && metrics.cls > 0.25) {
            console.log('- CLS is high. Set dimensions for images/videos and avoid inserting content above existing content.');
        }
        console.groupEnd();
    }
};

/**
 * Get resource timing data
 */
export const getResourceTimings = (): PerformanceResourceTiming[] => {
    if (typeof window === 'undefined' || !window.performance) {
        return [];
    }
    
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
};

/**
 * Analyze slow resources
 */
export const getSlowResources = (threshold = 1000): Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
}> => {
    const resources = getResourceTimings();
    
    return resources
        .filter(resource => resource.duration > threshold)
        .map(resource => ({
            name: resource.name.split('/').pop() || resource.name,
            duration: Math.round(resource.duration),
            size: Math.round((resource.transferSize || 0) / 1024), // KB
            type: resource.initiatorType,
        }))
        .sort((a, b) => b.duration - a.duration);
};

/**
 * Log slow resources to console
 */
export const reportSlowResources = (threshold = 1000): void => {
    const slowResources = getSlowResources(threshold);
    
    if (slowResources.length > 0) {
        console.group(`🐌 Slow Resources (>${threshold}ms)`);
        slowResources.forEach(resource => {
            console.log(`- ${resource.name}: ${resource.duration}ms (${resource.size}KB) [${resource.type}]`);
        });
        console.groupEnd();
    }
};

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    initPerformanceMonitoring();
    
    // Report slow resources after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            reportSlowResources(1000);
        }, 3000);
    });
}
