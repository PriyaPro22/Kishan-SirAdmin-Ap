'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Ultra-Fast Caching & Request Deduplication Service
 * Targets: API calls < 20ms, Page load < 50ms
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

interface PendingRequest {
  promise: Promise<any>;
  resolvers: Array<(value: any) => void>;
  rejecters: Array<(error: any) => void>;
}

class UltraFastCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pending = new Map<string, PendingRequest>();
  private immutableCache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    pending: 0,
    size: 0,
  };

  // Max cache size: 50MB
  private MAX_CACHE_SIZE = 50 * 1024 * 1024;
  private currentSize = 0;

  /**
   * Get from cache - < 1ms operation
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) || this.immutableCache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.immutableCache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Ultra-fast fetch with deduplication - < 20ms
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options = {
      ttl: 3600000, // 1 hour
      immutable: false,
      priority: 'normal' as 'high' | 'normal' | 'low',
    }
  ): Promise<T> {
    const startTime = performance.now();

    // Check cache first (< 1ms)
    const cached = this.get<T>(key);
    if (cached) {
      const time = performance.now() - startTime;
      console.log(`⚡ Cache hit (${time.toFixed(2)}ms): ${key}`);
      return cached;
    }

    // Check pending request (deduplication)
    if (this.pending.has(key)) {
      console.log(`⏳ Dedup: ${key}`);
      return new Promise((resolve, reject) => {
        const pending = this.pending.get(key)!;
        pending.resolvers.push(resolve);
        pending.rejecters.push(reject);
      });
    }

    // Create pending entry
    let resolveList: Array<(value: T) => void> = [];
    let rejectList: Array<(error: any) => void> = [];

    const promise = fetcher()
      .then((data) => {
        // Store in cache
        this.set(key, data, options.ttl, options.immutable);
        
        // Resolve all pending requests
        resolveList.forEach(resolve => resolve(data));
        this.pending.delete(key);
        
        const time = performance.now() - startTime;
        console.log(`✨ Fetched (${time.toFixed(2)}ms): ${key}`);
        return data;
      })
      .catch((error) => {
        rejectList.forEach(reject => reject(error));
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, {
      promise,
      resolvers: resolveList,
      rejecters: rejectList,
    });

    return promise;
  }

  /**
   * Set cache with size management
   */
  set<T>(key: string, data: T, ttl: number, immutable: boolean) {
    const size = this.estimateSize(data);

    // Evict if too large
    while (this.currentSize + size > this.MAX_CACHE_SIZE && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) {
        const entry = this.cache.get(firstKey);
        if (entry) {
          this.currentSize -= entry.size;
          this.cache.delete(firstKey);
        }
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      size,
    };

    if (immutable) {
      this.immutableCache.set(key, entry);
    } else {
      this.cache.set(key, entry);
    }

    this.currentSize += size;
    this.stats.size = this.currentSize;
  }

  /**
   * Estimate object size
   */
  private estimateSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.immutableCache.clear();
    this.currentSize = 0;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.currentSize,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }

  /**
   * Preload critical data
   */
  async preload(
    keys: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>
  ) {
    const promises = keys.map(({ key, fetcher, ttl }) =>
      this.fetch(key, fetcher, { 
        ttl: ttl || 3600000,
        immutable: false,
        priority: 'normal'
      }).catch(() => null)
    );
    return Promise.all(promises);
  }
}

// Singleton instance
export const ultraCache = new UltraFastCache();

/**
 * Hook for using cache in components
 */
export function useUltraCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; immutable?: boolean; priority?: 'high' | 'normal' | 'low' } = {}
) {
  const [data, setData] = React.useState<T | null>(() => 
    ultraCache.get<T>(key)
  );
  const [loading, setLoading] = React.useState(!data);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    ultraCache
      .fetch(key, fetcher, { 
        ttl: options.ttl || 3600000,
        immutable: options.immutable || false,
        priority: options.priority || 'normal'
      })
      .then((result) => {
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [key, options]);

  return { data, loading, error };
}
