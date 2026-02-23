'use client';

import axios from 'axios';
import { ultraCache } from './ultraCache';

/**
 * Ultra-Fast API Service
 * Target: All API calls < 20ms (with cache)
 */

interface APIConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  immutable?: boolean;
}

class UltraFastAPI {
  private instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in'}/api`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
    },
  });

  private requestCache = new Map<string, any>();
  private inFlightRequests = new Map<string, Promise<any>>();

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor with error handling
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        // Retry logic with exponential backoff
        if (!config.__retryCount) {
          config.__retryCount = 0;
        }

        if (
          config.__retryCount < 2 &&
          (error.code === 'ECONNABORTED' || !error.response)
        ) {
          config.__retryCount++;
          const delay = Math.pow(2, config.__retryCount) * 100;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.instance(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request with ultra-fast caching
   */
  async get<T>(
    url: string,
    config: APIConfig = {}
  ): Promise<T> {
    const {
      cache = true,
      cacheTTL = 300000, // 5 minutes
      immutable = false,
    } = config;

    const cacheKey = `GET:${url}`;

    // Try ultra cache first (< 1ms)
    if (cache) {
      const cached = ultraCache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check in-flight requests for deduplication
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    // Create request
    const request = this.instance
      .get<T>(url)
      .then((res) => {
        this.inFlightRequests.delete(cacheKey);

        // Store in ultra cache
        if (cache) {
          ultraCache.set(cacheKey, res.data, cacheTTL, immutable);
        }

        return res.data;
      })
      .catch((error) => {
        this.inFlightRequests.delete(cacheKey);
        throw error;
      });

    if (cache) {
      this.inFlightRequests.set(cacheKey, request);
    }

    return request;
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: any,
    config: APIConfig = {}
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data);
    return response.data;
  }

  /**
   * Batch requests
   */
  async batch<T>(
    requests: Array<{ url: string; method?: 'get' | 'post'; data?: any }>
  ): Promise<T[]> {
    const promises = requests.map((req) => {
      if (req.method === 'post') {
        return this.post(req.url, req.data);
      }
      return this.get(req.url);
    });

    return Promise.all(promises) as Promise<T[]>;
  }

  /**
   * Prefetch data for faster page load
   */
  async prefetch(urls: string[]) {
    const promises = urls.map((url) =>
      this.get(url, { cache: true, immutable: true }).catch(() => null)
    );
    return Promise.all(promises);
  }
}

export const ultraAPI = new UltraFastAPI();

/**
 * React hook for ultra-fast data fetching
 */
import React from 'react';
import { useEffect, useState } from 'react';

export function useUltraAPI<T>(
  url: string,
  options: APIConfig = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await ultraAPI.get<T>(url, options);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, options]);

  return { data, loading, error };
}
