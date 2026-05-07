package com.cloudcompare.ai.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight TTL Cache — direct port of cache.js
 * Default TTL: 1 hour. Max size: 1000 entries.
 */
@Service
public class CacheService {

    private static final long TTL_MS = 60 * 60 * 1000L; // 1 hour
    private static final int MAX_SIZE = 1000;

    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

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
        long expiresAt = System.currentTimeMillis() + TTL_MS;
        cache.put(key, new CacheEntry(value, expiresAt));

        // Naive cleanup: if cache grows too large, clear expired first
        if (cache.size() > MAX_SIZE) {
            clearExpired();
            if (cache.size() > 800) {
                // If still too big, drop the oldest half
                int count = 0;
                int half = cache.size() / 2;
                for (String k : cache.keySet()) {
                    if (count++ < half) {
                        cache.remove(k);
                    }
                }
            }
        }
    }

    private void clearExpired() {
        long now = System.currentTimeMillis();
        cache.entrySet().removeIf(e -> now > e.getValue().expiresAt);
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
