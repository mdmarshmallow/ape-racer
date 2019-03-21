const admin = require('firebase-admin');

/**
 * Uncomment when using this file for testing
 */
//const serviceAccount = require('../aperacer-39c23-firebase-adminsdk-18nxy-4d6292d1b1.json');

admin.initializeApp({
    /**
     * Uncomment first credential property for testing, uncomment second for deploying
     */
    //credential: admin.credential.cert(serviceAccount),
    credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: 'https://aperacer-39c23.firebaseio.com'
});

const database = admin.database();
const ref = database.ref('leaderboard');

module.exports.addToLeaderboard = (name, wpm) => {
    ref.once('value', snapshot => {
        if (snapshot.val() != null) {
            if (Object.keys(snapshot.val()).length < 10) {
                ref.push({
                    name,
                    wpm
                });
            } else {
                let smallestWPM = Number.MAX_VALUE;
                let smallestKey;
                Object.entries(snapshot.val()).forEach(entry => {
                    if (entry[1].wpm < smallestWPM) {
                        smallestWPM = entry[1].wpm;
                        smallestKey = entry[0];
                    }
                })
                if (wpm > smallestWPM) {
                    ref.child(smallestKey).update({
                        name,
                        wpm
                    });
                }
            }
        } else {
            ref.push({
                name,
                wpm
            });
        }
    });
}

module.exports.retrieveLeaderBoard = callback => {
    ref.once('value', snapshot => {
        if (snapshot.val() === null) {
            callback("No players on board");
        } else {
            let entries = Object.entries(snapshot.val()).map(entry => entry[1]);
            entries.sort((a, b) => b.wpm - a.wpm);
            entries.forEach(entry => {
                entry.wpm = Math.round(entry.wpm);
            });
            callback(entries);
        }
    });
}
