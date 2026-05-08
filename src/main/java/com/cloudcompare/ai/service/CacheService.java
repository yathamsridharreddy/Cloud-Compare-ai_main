package com.cloudcompare.ai.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Production-grade LRU Cache with TTL support.
 * Uses synchronized LinkedHashMap for O(1) eviction and access.
 */
@Service
public class CacheService {

    private static final long DEFAULT_TTL_MS = 60 * 60 * 1000L; // 1 hour
    private static final int MAX_ENTRIES = 500;

    private final Map<String, CacheEntry> cache = Collections.synchronizedMap(
        new LinkedHashMap<String, CacheEntry>(MAX_ENTRIES, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, CacheEntry> eldest) {
                return size() > MAX_ENTRIES;
            }
        }
    );

    public Object get(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) return null;

        if (System.currentTimeMillis() > entry.expiresAt) {
            cache.remove(key);
            return null;
        }

        return entry.value;
    }

    public void set(String key, Object value) {
        set(key, value, DEFAULT_TTL_MS);
    }

    public void set(String key, Object value, long ttlMs) {
        cache.put(key, new CacheEntry(value, System.currentTimeMillis() + ttlMs));
    }

    public void clear() {
        cache.clear();
    }

    private static class CacheEntry {
        final Object value;
        final long expiresAt;

        CacheEntry(Object value, long expiresAt) {
            this.value = value;
            this.expiresAt = expiresAt;
        }
    }
}
