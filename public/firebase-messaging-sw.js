importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBLwRIPjMdlBxJjiXy-oulrERMR35ZS34A",
    authDomain: "appbijiliwalaaya-user.firebaseapp.com",
    databaseURL: "https://appbijiliwalaaya-user-default-rtdb.firebaseio.com",
    projectId: "appbijiliwalaaya-user",
    storageBucket: "appbijiliwalaaya-user.appspot.com",
    messagingSenderId: "910454978899",
    appId: "1:910454978899:web:fa2106ee0ab9ef9cf149a6",
    measurementId: "G-MZHP59QSHP"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        const notificationTitle = payload.notification?.title || "Incoming Request";
        const notificationOptions = {
            body: payload.notification?.body || "Tap to view details",
            icon: '/favicon.ico',
            data: payload.data,
            // Call-style vibration logic
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: 'renotify-tag', // Replace existing notification
            renotify: true, // Play sound again
            priority: 'high',
            requireInteraction: true, // Keep notification until user clicks
            actions: [
                { action: 'open', title: 'VIEW DETAILS' },
                { action: 'close', title: 'DISMISS' }
            ]
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });

    self.addEventListener('notificationclick', function (event) {
        console.log('[Service Worker] Notification click received.', event.action);
        event.notification.close();

        if (event.action === 'close') {
            return;
        }

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
                // Check if there's already a window open
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url && 'focus' in client) {
                        // Focus existing window and navigate/reload to trigger overlay
                        // Adding a hash or param to trigger handler
                        return client.focus().then(c => {
                            // Optional: verify if we need to navigate
                            if (!client.url.includes("?fcm_notification=true")) {
                                return client.navigate(client.url + (client.url.includes('?') ? '&' : '?') + 'fcm_notification=true');
                            }
                            return c;
                        });
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow('/?fcm_notification=true');
                }
            })
        );
    });

} catch (error) {
    console.error('[firebase-messaging-sw.js] Initialization error:', error);
}
