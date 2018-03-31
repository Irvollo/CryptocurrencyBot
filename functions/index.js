var functions = require('firebase-functions');
var twit = require('twit');
var config = require('./config.js');
var XMLHttpRequest = require('xhr2');

var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var Twitter = new twit(config);

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

//var options = {screen_name: 'irvollo', count: 10}

exports.tweetBest = functions.https.onRequest((req, res) => {
    getJSON('https://www.reddit.com/r/cryptocurrency/top.json', function(err, data) {
        if (err !== null) {
            return res.send(err);
        } else {
            var bestPost = data.data.children[1]
            var toPost = bestPost.data.title + ' https://reddit.com' + bestPost.data.permalink
            Twitter.post('statuses/update', {status: toPost},  function(error, tweet, response){
                if(error){
                  console.log(error);
                }
                console.log(tweet);  // Tweet body.
                console.log(response);
                return res.send(bestPost);  // Raw response object.
            });
        }
    });
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
