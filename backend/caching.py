"""
NOUFAL ERP - Caching System
نظام التخزين المؤقت - Redis + Memory Cache

Features:
- Redis caching for distributed environments
- In-memory caching as fallback
- Automatic cache invalidation
- TTL (Time To Live) support
- Cache statistics and monitoring
- Decorator-based caching for functions
"""

import logging
import time
import pickle
import hashlib
import json
from functools import wraps
from typing import Any, Optional, Callable, Dict
from datetime import timedelta
import threading

# Try to import Redis, fallback to in-memory cache
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

logger = logging.getLogger(__name__)


class InMemoryCache:
    """
    Simple in-memory cache implementation
    تخزين مؤقت في الذاكرة كبديل عن Redis
    """
    
    def __init__(self):
        self._cache: Dict[str, tuple] = {}  # key: (value, expiry_time)
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0
        logger.info("InMemoryCache initialized")
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self._lock:
            if key in self._cache:
                value, expiry = self._cache[key]
                # Check if expired
                if expiry is None or time.time() < expiry:
                    self._hits += 1
                    return value
                else:
                    # Remove expired entry
                    del self._cache[key]
            
            self._misses += 1
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (None = no expiry)
        """
        with self._lock:
            expiry = time.time() + ttl if ttl else None
            self._cache[key] = (value, expiry)
        return True
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
        return False
    
    def clear(self) -> bool:
        """Clear all cache"""
        with self._lock:
            self._cache.clear()
            logger.info("InMemoryCache cleared")
        return True
    
    def exists(self, key: str) -> bool:
        """Check if key exists and is not expired"""
        return self.get(key) is not None
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        with self._lock:
            total_requests = self._hits + self._misses
            hit_rate = (self._hits / total_requests * 100) if total_requests > 0 else 0
            
            # Count non-expired entries
            current_time = time.time()
            active_keys = sum(
                1 for _, expiry in self._cache.values()
                if expiry is None or expiry > current_time
            )
            
            return {
                'cache_type': 'in_memory',
                'total_keys': active_keys,
                'hits': self._hits,
                'misses': self._misses,
                'total_requests': total_requests,
                'hit_rate': round(hit_rate, 2)
            }
    
    def cleanup_expired(self):
        """Remove expired entries"""
        with self._lock:
            current_time = time.time()
            expired_keys = [
                key for key, (_, expiry) in self._cache.items()
                if expiry is not None and expiry <= current_time
            ]
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")


class RedisCache:
    """
    Redis-based cache implementation
    تخزين مؤقت باستخدام Redis
    """
    
    def __init__(self, host: str = 'localhost', port: int = 6379, db: int = 0, password: Optional[str] = None):
        """
        Initialize Redis cache
        
        Args:
            host: Redis host
            port: Redis port
            db: Redis database number
            password: Redis password (optional)
        """
        try:
            self.redis_client = redis.Redis(
                host=host,
                port=port,
                db=db,
                password=password,
                decode_responses=False  # We'll handle encoding/decoding
            )
            # Test connection
            self.redis_client.ping()
            logger.info(f"RedisCache connected to {host}:{port} (db={db})")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from Redis cache"""
        try:
            value = self.redis_client.get(key)
            if value:
                return pickle.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis get error for key '{key}': {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in Redis cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (None = no expiry)
        """
        try:
            serialized = pickle.dumps(value)
            if ttl:
                return self.redis_client.setex(key, ttl, serialized)
            else:
                return self.redis_client.set(key, serialized)
        except Exception as e:
            logger.error(f"Redis set error for key '{key}': {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from Redis cache"""
        try:
            return self.redis_client.delete(key) > 0
        except Exception as e:
            logger.error(f"Redis delete error for key '{key}': {e}")
            return False
    
    def clear(self) -> bool:
        """Clear all keys in current database"""
        try:
            self.redis_client.flushdb()
            logger.info("Redis cache cleared")
            return True
        except Exception as e:
            logger.error(f"Redis clear error: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in Redis"""
        try:
            return self.redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis exists error for key '{key}': {e}")
            return False
    
    def get_stats(self) -> Dict:
        """Get Redis cache statistics"""
        try:
            info = self.redis_client.info('stats')
            keyspace = self.redis_client.info('keyspace')
            
            # Get current DB stats
            db_key = f'db{self.redis_client.connection_pool.connection_kwargs["db"]}'
            db_stats = keyspace.get(db_key, {})
            total_keys = db_stats.get('keys', 0) if isinstance(db_stats, dict) else 0
            
            return {
                'cache_type': 'redis',
                'total_keys': total_keys,
                'hits': info.get('keyspace_hits', 0),
                'misses': info.get('keyspace_misses', 0),
                'total_requests': info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0),
                'hit_rate': round(
                    (info.get('keyspace_hits', 0) / (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0) + 1)) * 100,
                    2
                )
            }
        except Exception as e:
            logger.error(f"Redis stats error: {e}")
            return {'error': str(e)}


class CacheManager:
    """
    Unified cache manager supporting both Redis and in-memory caching
    مدير التخزين المؤقت الموحد - يدعم Redis والذاكرة
    """
    
    def __init__(self, use_redis: bool = True, redis_config: Optional[Dict] = None):
        """
        Initialize cache manager
        
        Args:
            use_redis: Try to use Redis if available
            redis_config: Redis configuration dict (host, port, db, password)
        """
        self.cache = None
        
        if use_redis and REDIS_AVAILABLE:
            try:
                config = redis_config or {}
                self.cache = RedisCache(
                    host=config.get('host', 'localhost'),
                    port=config.get('port', 6379),
                    db=config.get('db', 0),
                    password=config.get('password')
                )
                logger.info("CacheManager initialized with Redis")
            except Exception as e:
                logger.warning(f"Failed to initialize Redis, falling back to InMemoryCache: {e}")
                self.cache = InMemoryCache()
        else:
            self.cache = InMemoryCache()
            if not REDIS_AVAILABLE:
                logger.info("Redis not available, using InMemoryCache")
            else:
                logger.info("CacheManager initialized with InMemoryCache (by configuration)")
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        return self.cache.get(key)
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        return self.cache.set(key, value, ttl)
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        return self.cache.delete(key)
    
    def clear(self) -> bool:
        """Clear all cache"""
        return self.cache.clear()
    
    def exists(self, key: str) -> bool:
        """Check if key exists"""
        return self.cache.exists(key)
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        return self.cache.get_stats()
    
    def generate_key(self, *args, **kwargs) -> str:
        """
        Generate cache key from arguments
        توليد مفتاح التخزين المؤقت من المعاملات
        """
        key_data = f"{args}:{sorted(kwargs.items())}"
        return hashlib.md5(key_data.encode()).hexdigest()


# Global cache manager instance
_cache_manager: Optional[CacheManager] = None


def get_cache_manager() -> CacheManager:
    """Get or create global cache manager instance"""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = CacheManager()
    return _cache_manager


def cached(ttl: Optional[int] = 300, key_prefix: str = ""):
    """
    Decorator for caching function results
    ديكوريتر للتخزين المؤقت لنتائج الدوال
    
    Args:
        ttl: Time to live in seconds (default: 300 = 5 minutes)
        key_prefix: Prefix for cache key
    
    Example:
        @cached(ttl=600, key_prefix="user")
        def get_user(user_id):
            return db.query(User).get(user_id)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache_manager()
            
            # Generate cache key
            func_name = f"{func.__module__}.{func.__name__}"
            key_data = f"{key_prefix}:{func_name}:{args}:{sorted(kwargs.items())}"
            cache_key = hashlib.md5(key_data.encode()).hexdigest()
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT for {func_name}")
                return cached_value
            
            # Cache miss - execute function
            logger.debug(f"Cache MISS for {func_name}")
            result = func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result, ttl)
            
            return result
        
        # Add cache control methods
        wrapper.clear_cache = lambda: get_cache_manager().clear()
        wrapper.cache_key = lambda *args, **kwargs: hashlib.md5(
            f"{key_prefix}:{func.__module__}.{func.__name__}:{args}:{sorted(kwargs.items())}".encode()
        ).hexdigest()
        
        return wrapper
    return decorator


def invalidate_cache(key_prefix: str):
    """
    Invalidate all cache entries with given prefix
    إبطال جميع إدخالات التخزين المؤقت بالبادئة المعطاة
    
    Note: This only works with patterns for Redis. For InMemoryCache, it clears all.
    """
    cache = get_cache_manager()
    
    # For Redis, we can use pattern matching
    if isinstance(cache.cache, RedisCache):
        try:
            pattern = f"{key_prefix}:*"
            keys = cache.cache.redis_client.keys(pattern)
            if keys:
                cache.cache.redis_client.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache entries with prefix '{key_prefix}'")
        except Exception as e:
            logger.error(f"Failed to invalidate cache with prefix '{key_prefix}': {e}")
    else:
        # For InMemoryCache, we need to clear all (no pattern support)
        logger.warning(f"InMemoryCache doesn't support prefix invalidation, clearing all cache")
        cache.clear()


# Flask integration
def init_cache(app):
    """
    Initialize caching for Flask app
    تهيئة التخزين المؤقت لتطبيق Flask
    """
    # Get Redis configuration from app config
    use_redis = app.config.get('USE_REDIS_CACHE', True)
    redis_config = {
        'host': app.config.get('REDIS_HOST', 'localhost'),
        'port': app.config.get('REDIS_PORT', 6379),
        'db': app.config.get('REDIS_DB', 0),
        'password': app.config.get('REDIS_PASSWORD')
    }
    
    # Initialize cache manager
    cache_manager = CacheManager(use_redis=use_redis, redis_config=redis_config)
    
    # Store in app config
    app.config['CACHE_MANAGER'] = cache_manager
    
    # Set global cache manager
    global _cache_manager
    _cache_manager = cache_manager
    
    logger.info("Cache system initialized")
    
    # Add cache statistics endpoint
    @app.route('/api/cache/stats')
    def cache_stats():
        """Get cache statistics"""
        return cache_manager.get_stats()
    
    @app.route('/api/cache/clear', methods=['POST'])
    def cache_clear():
        """Clear all cache"""
        success = cache_manager.clear()
        return {
            "success": success,
            "message": "Cache cleared successfully" if success else "Failed to clear cache"
        }
    
    return cache_manager


# Usage examples
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Example 1: Basic usage
    print("=" * 80)
    print("EXAMPLE 1: Basic Cache Usage")
    print("=" * 80)
    
    cache = CacheManager(use_redis=False)  # Use in-memory cache
    
    # Set and get
    cache.set("user:1", {"name": "Ahmed", "role": "Admin"}, ttl=60)
    user = cache.get("user:1")
    print(f"Cached user: {user}")
    
    # Check exists
    print(f"Key 'user:1' exists: {cache.exists('user:1')}")
    print(f"Key 'user:2' exists: {cache.exists('user:2')}")
    
    # Get stats
    stats = cache.get_stats()
    print(f"Cache stats: {stats}")
    
    # Example 2: Using decorator
    print("\n" + "=" * 80)
    print("EXAMPLE 2: Cached Decorator")
    print("=" * 80)
    
    @cached(ttl=10, key_prefix="fibonacci")
    def fibonacci(n):
        """Calculate fibonacci number (slow recursive implementation)"""
        if n <= 1:
            return n
        return fibonacci(n - 1) + fibonacci(n - 2)
    
    # First call - cache miss
    start = time.time()
    result1 = fibonacci(10)
    time1 = time.time() - start
    print(f"First call: fibonacci(10) = {result1} (took {time1:.4f}s)")
    
    # Second call - cache hit
    start = time.time()
    result2 = fibonacci(10)
    time2 = time.time() - start
    print(f"Second call: fibonacci(10) = {result2} (took {time2:.4f}s)")
    print(f"Speedup: {time1 / time2:.2f}x faster!")
    
    # Final stats
    print("\n" + "=" * 80)
    print("FINAL CACHE STATISTICS")
    print("=" * 80)
    final_stats = cache.get_stats()
    print(f"Cache Type: {final_stats['cache_type']}")
    print(f"Total Keys: {final_stats['total_keys']}")
    print(f"Hits: {final_stats['hits']}")
    print(f"Misses: {final_stats['misses']}")
    print(f"Hit Rate: {final_stats['hit_rate']}%")
