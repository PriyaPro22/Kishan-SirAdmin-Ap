const admin = require('firebase-admin');

// ⚠️ REPLACE WITH YOUR SERVICE ACCOUNT KEY PATH
// You need to download serviceAccountKey.json from Firebase Console -> Project Settings -> Service accounts
// and place it in the same directory as this script.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// ⚠️ REPLACE WITH YOUR DEVICE TOKEN (get from console logs)
const registrationToken = 'YOUR_FCM_TOKEN_HERE';

const message = {
    notification: {
        title: 'Background Test',
        body: 'Ye notification background mein bhi dikhna chahiye!'
    },
    data: {
        type: 'TECH_QUESTION',
        jobId: '12345',
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // Optional for mobile
    },
    token: registrationToken
};

admin.messaging().send(message)
    .then((response) => {
        console.log('Successfully sent message:', response);
        process.exit(0);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
        process.exit(1);
    });
