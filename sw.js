/**
 * Rising Star: Music Mogul - Service Worker
 * Provides PWA functionality, offline support, and caching
 */

const CACHE_NAME = 'rising-star-v1.0.0';
const STATIC_CACHE = 'rising-star-static';
const DYNAMIC_CACHE = 'rising-star-dynamic';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles/main.css',
    '/styles/components.css',
    '/styles/responsive.css',
    '/js/main.js',
    '/js/core/game-engine.js',
    '/js/core/ai-simulation.js',
    '/js/core/data-manager.js',
    '/js/ui/character-creator.js',
    '/js/ui/interface-manager.js',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different types of requests
    if (isStaticFile(request)) {
        event.respondWith(cacheFirstStrategy(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(networkFirstStrategy(request));
    } else {
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
});

// Cache-first strategy for static files
async function cacheFirstStrategy(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache-first strategy failed:', error);
        return getOfflineFallback(request);
    }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return getOfflineFallback(request);
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, return cached version if available
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Check if request is for a static file
function isStaticFile(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    return STATIC_FILES.some(file => pathname.endsWith(file)) ||
           pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
}

// Check if request is for API data
function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
           url.pathname.includes('game-data') ||
           url.pathname.includes('save-data');
}

// Get offline fallback
function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    if (request.destination === 'document') {
        return caches.match('/index.html');
    }
    
    if (request.destination === 'image') {
        return new Response('', {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'image/svg+xml'
            }
        });
    }
    
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}

// Background sync for game saves
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'game-save') {
        event.waitUntil(syncGameData());
    }
});

// Sync game data when back online
async function syncGameData() {
    try {
        // Get pending saves from IndexedDB
        const pendingSaves = await getPendingSaves();
        
        for (const save of pendingSaves) {
            try {
                // Attempt to sync save data
                await uploadSaveData(save);
                await markSaveAsSynced(save.id);
                console.log('✅ Synced save:', save.id);
            } catch (error) {
                console.error('❌ Failed to sync save:', save.id, error);
            }
        }
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Message handling
self.addEventListener('message', (event) => {
    const { action, data } = event.data;
    
    switch (action) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CACHE_SAVE_DATA':
            cacheSaveData(data).then(() => {
                event.ports[0].postMessage({ success: true });
            }).catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            }).catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
            break;
    }
});

// Cache save data
async function cacheSaveData(saveData) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(saveData), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=86400'
        }
    });
    
    await cache.put('/game-save/current', response);
}

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Placeholder functions for IndexedDB operations
async function getPendingSaves() {
    // This would interface with IndexedDB to get pending saves
    return [];
}

async function uploadSaveData(save) {
    // This would upload save data to a server if available
    // For GitHub Pages, this might save to localStorage or IndexedDB
    return Promise.resolve();
}

async function markSaveAsSynced(saveId) {
    // Mark save as successfully synced
    return Promise.resolve();
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            data = { title: 'Rising Star', body: event.data.text() };
        }
    }
    
    const options = {
        title: data.title || 'Rising Star: Music Mogul',
        body: data.body || 'Nova atualização disponível!',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-72.png',
        tag: data.tag || 'general',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Notification clicked:', event.notification.tag);
    
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // If game is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Otherwise, open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Periodic background tasks
self.addEventListener('periodicsync', (event) => {
    console.log('⏰ Periodic sync triggered:', event.tag);
    
    if (event.tag === 'update-trends') {
        event.waitUntil(updateMusicTrends());
    }
});

// Update music trends in background
async function updateMusicTrends() {
    try {
        // This would fetch latest music trends
        // For now, just log the action
        console.log('🎵 Updating music trends in background');
    } catch (error) {
        console.error('❌ Failed to update trends:', error);
    }
}

// Handle unhandled rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection in SW:', event.reason);
    event.preventDefault();
});

// Log service worker registration
console.log('🎵 Rising Star: Music Mogul Service Worker loaded');
