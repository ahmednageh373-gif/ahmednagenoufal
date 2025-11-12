/**
 * Logger Middleware for Zustand
 * Logs all state changes with detailed information
 */

import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name = 'Store') => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const prevState = get();
    set(...args);
    const nextState = get();
    
    // Only log if state actually changed
    if (prevState === nextState) return;
    
    // Calculate changes
    const changes: Record<string, any> = {};
    let changeCount = 0;
    
    Object.keys(nextState as object).forEach((key) => {
      if ((prevState as any)[key] !== (nextState as any)[key]) {
        changes[key] = {
          from: (prevState as any)[key],
          to: (nextState as any)[key],
        };
        changeCount++;
      }
    });
    
    // Only log if there are actual changes
    if (changeCount === 0) return;
    
    // Get timestamp
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    // Console styles
    const titleStyle = 'color: #4CAF50; font-weight: bold; font-size: 12px;';
    const nameStyle = 'color: #2196F3; font-weight: bold;';
    const prevStyle = 'color: #FF9800; font-weight: bold;';
    const nextStyle = 'color: #4CAF50; font-weight: bold;';
    const changesStyle = 'color: #9C27B0; font-weight: bold;';
    const timeStyle = 'color: #607D8B; font-size: 10px;';
    
    console.groupCollapsed(
      `%c[${name}] %c${timestamp} %c${changeCount} change${changeCount > 1 ? 's' : ''}`,
      titleStyle,
      timeStyle,
      nameStyle
    );
    
    // Log previous state
    console.log('%cPrevious State:', prevStyle, prevState);
    
    // Log next state
    console.log('%cNext State:', nextStyle, nextState);
    
    // Log changes with detailed diff
    if (Object.keys(changes).length > 0) {
      console.log('%cChanges:', changesStyle, changes);
      
      // Log individual changes in a readable format
      Object.entries(changes).forEach(([key, value]) => {
        const { from, to } = value;
        
        // Handle arrays
        if (Array.isArray(from) && Array.isArray(to)) {
          const added = to.filter(item => !from.includes(item));
          const removed = from.filter(item => !to.includes(item));
          
          if (added.length > 0 || removed.length > 0) {
            console.log(
              `%c${key}:`,
              'color: #E91E63; font-weight: bold;',
              {
                length: { from: from.length, to: to.length },
                added: added.length > 0 ? added : 'none',
                removed: removed.length > 0 ? removed : 'none',
              }
            );
          }
        } 
        // Handle objects
        else if (typeof from === 'object' && typeof to === 'object' && from !== null && to !== null) {
          const objChanges: Record<string, any> = {};
          const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
          
          allKeys.forEach((objKey) => {
            if ((from as any)[objKey] !== (to as any)[objKey]) {
              objChanges[objKey] = {
                from: (from as any)[objKey],
                to: (to as any)[objKey],
              };
            }
          });
          
          if (Object.keys(objChanges).length > 0) {
            console.log(
              `%c${key}:`,
              'color: #E91E63; font-weight: bold;',
              objChanges
            );
          }
        }
        // Handle primitives
        else {
          console.log(
            `%c${key}:`,
            'color: #E91E63; font-weight: bold;',
            `${from} → ${to}`
          );
        }
      });
    }
    
    // Log stack trace (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.trace('Stack Trace');
    }
    
    console.groupEnd();
  };

  store.setState = loggedSet;

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as unknown as Logger;

/**
 * Advanced logger with filtering options
 */
interface LoggerOptions {
  name?: string;
  enabled?: boolean;
  collapsed?: boolean;
  filter?: (state: any) => boolean;
  actionFilter?: (action: any) => boolean;
  stateTransform?: (state: any) => any;
  actionTransform?: (action: any) => any;
}

export function createLogger<T>(options: LoggerOptions = {}): Logger {
  const {
    name = 'Store',
    enabled = process.env.NODE_ENV === 'development',
    collapsed = true,
    filter = () => true,
    stateTransform = (state) => state,
  } = options;

  return (f) => (set, get, store) => {
    if (!enabled) {
      return f(set, get, store);
    }

    const loggedSet: typeof set = (...args) => {
      const prevState = get();
      
      if (!filter(prevState)) {
        set(...args);
        return;
      }
      
      set(...args);
      const nextState = get();
      
      if (prevState === nextState) return;
      
      const timestamp = new Date().toISOString();
      const transformedPrev = stateTransform(prevState);
      const transformedNext = stateTransform(nextState);
      
      const logFn = collapsed ? console.groupCollapsed : console.group;
      
      logFn(
        `%c[${name}] %c@ ${timestamp}`,
        'color: #4CAF50; font-weight: bold;',
        'color: #607D8B; font-size: 10px;'
      );
      
      console.log('%cPrevious:', 'color: #FF9800; font-weight: bold;', transformedPrev);
      console.log('%cNext:', 'color: #4CAF50; font-weight: bold;', transformedNext);
      
      console.groupEnd();
    };

    store.setState = loggedSet;

    return f(loggedSet, get, store);
  };
}

/**
 * Performance logger - logs execution time
 */
export function performanceLogger<T>(name: string = 'Store'): Logger {
  return (f) => (set, get, store) => {
    const loggedSet: typeof set = (...args) => {
      const startTime = performance.now();
      set(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // Log if slower than 60fps (16ms)
        console.warn(
          `%c[Performance] ${name}`,
          'color: #FF5722; font-weight: bold;',
          `took ${duration.toFixed(2)}ms`
        );
      }
    };

    store.setState = loggedSet;

    return f(loggedSet, get, store);
  };
}

/**
 * Action logger - logs specific actions with names
 */
export function actionLogger<T>(name: string = 'Store'): Logger {
  return (f) => (set, get, store) => {
    const originalSet = set;
    
    const namedSet = (partial: any, replace?: boolean, actionName?: string) => {
      if (actionName) {
        console.log(
          `%c[Action] ${actionName}`,
          'color: #2196F3; font-weight: bold;',
          partial
        );
      }
      originalSet(partial, replace);
    };
    
    return f(namedSet as typeof set, get, store);
  };
}

/**
 * Diff logger - shows only what changed
 */
export function diffLogger<T>(name: string = 'Store'): Logger {
  return (f) => (set, get, store) => {
    const loggedSet: typeof set = (...args) => {
      const prevState = get();
      set(...args);
      const nextState = get();
      
      const diff = getDiff(prevState, nextState);
      
      if (Object.keys(diff).length > 0) {
        console.log(
          `%c[${name}] Diff:`,
          'color: #9C27B0; font-weight: bold;',
          diff
        );
      }
    };

    store.setState = loggedSet;

    return f(loggedSet, get, store);
  };
}

/**
 * Helper function to calculate diff between two objects
 */
function getDiff(prev: any, next: any): Record<string, any> {
  const diff: Record<string, any> = {};
  
  Object.keys(next).forEach((key) => {
    if (prev[key] !== next[key]) {
      diff[key] = {
        from: prev[key],
        to: next[key],
      };
    }
  });
  
  return diff;
}

/**
 * Batch logger - groups multiple updates together
 */
let batchTimeout: NodeJS.Timeout | null = null;
let batchedChanges: any[] = [];

export function batchLogger<T>(name: string = 'Store', delay: number = 100): Logger {
  return (f) => (set, get, store) => {
    const loggedSet: typeof set = (...args) => {
      set(...args);
      
      const change = {
        timestamp: Date.now(),
        state: get(),
      };
      
      batchedChanges.push(change);
      
      if (batchTimeout) {
        clearTimeout(batchTimeout);
      }
      
      batchTimeout = setTimeout(() => {
        if (batchedChanges.length > 0) {
          console.log(
            `%c[${name}] Batched Updates (${batchedChanges.length}):`,
            'color: #FF9800; font-weight: bold;',
            batchedChanges
          );
          batchedChanges = [];
        }
        batchTimeout = null;
      }, delay);
    };

    store.setState = loggedSet;

    return f(loggedSet, get, store);
  };
}
