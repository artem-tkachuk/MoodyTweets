const request = require('request');
const admin = require('firebase-admin');

exports.renderMoodScreen = (req, res) => {
    const handle = req.query.handle;
    const getTweetsCloudFunctionURL = 'https://us-central1-moody-tweets-62047.cloudfunctions.net/getTweets';
    const MLgetMoodCloudFunctionURL = 'https://us-central1-moody-tweets-62047.cloudfunctions.net/MLgetMood';
    const getProfilePicCloudFunctionURL = 'https://us-central1-moody-tweets-62047.cloudfunctions.net/function-1';

    request({
        url: getTweetsCloudFunctionURL,
        method: 'POST',
        json: {"handle": handle}
    }, (err, response, tweets) => {

        const db = admin.firestore();

        request({
            url: MLgetMoodCloudFunctionURL,
            method: 'POST',
            json: {"tweets": tweets}
        }, (err, response, mood) => {

            //log to firestore

            request({
                url: getProfilePicCloudFunctionURL,
                method: 'POST',
                json: {"handle": handle}
            }, (err, response, profilePicUrl) => {


                let userRef = db.collection('users').doc(handle);

                userRef.set({
                    profilePicURL: profilePicUrl
                }, {merge: true})

                //let userRef = db.collection('users').doc(handle);

                // userRef.set({
                //
                // })

                let userMoodsRef = userRef.collection('moods');

                userMoodsRef.add({
                    mood: mood,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                }).then((doc) => {
                    switch (mood) {
                        case 1:
                            res.render('moods/angry/angry');
                            break;
                        case 2:
                            res.render('moods/sad/sad');
                            break;
                        case 3:
                            res.render('moods/neutral/neutral');
                            break;
                        case 4:
                            res.render('moods/fearful/fearful');
                            break;
                        case 5:
                            res.render('moods/surprised/surprised');
                            break;
                        case 6:
                            res.render('moods/happy/happy');
                            break;
                        default:
                            res.send(`Hello, World!`);
                    }
                })
            });
        });
    });
}