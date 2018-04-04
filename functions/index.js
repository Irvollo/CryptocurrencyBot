var functions = require('firebase-functions');
var twit = require('twit');
var config = require('./config.js');
var XMLHttpRequest = require('xhr2');
var dictionary = require('./dictionary.js')

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

/* Check if the title contains a word related to cryptocurrency and return a hashtag set */ 
var postHashtag =  function (title) {
    var termsLenght = dictionary.commonTerms.length;
    var substrings = [];
    while(termsLenght--) {
        if(title.includes(dictionary.commonTerms[termsLenght])) {
            substrings.push(dictionary.commonTerms[termsLenght])
        }
    }
    
    var hashtags = [];
    for (i = 0;i < substrings.length; i++) {
        console.log(dictionary.hashtags[substrings[i]]);
        hashtags.push(dictionary.hashtags[substrings[i]])
    }

    hashtags = hashtags.filter((x, i, a) => a.indexOf(x) == i)

    var toadd = ' ';
    for(i=0; i < hashtags.length; i++) {
        toadd = toadd + hashtags[i] + ' ';
    }

    console.log(toadd);
    return toadd;


}

var parseTwit = function(post) {
    return post.data.title + ' ' + postHashtag(post.data.title) + ' https://reddit.com' + post.data.permalink
}

var isAlreadyPost = function(post, tweets) {
    var alreadyTwit = false;
    for (var i = 0; i < tweets.length ; i++) {
        if (!alreadyTwit && tweets[i].text.includes(post.data.title)) {
            return true;
        } else {
            alreadyTwit = false;
        }
    }
    return alreadyTwit;
}

var options = { screen_name: 'CC_Reddit',
                count: 15 };

exports.tweetBest = functions.https.onRequest((req, res) => {
    getJSON('https://www.reddit.com/r/cryptocurrency/top.json', function(err, data) {
        if (err !== null) {
            return res.send(err);
        } else {
            var bestPost = data.data.children[Math.floor((Math.random() * 25) + 1)]
            Twitter.get('statuses/user_timeline', options, function(err, data) {
                var isPost = isAlreadyPost(bestPost, data); 
                if (!isPost) {
                    var toPost = parseTwit(bestPost);
                    Twitter.post('statuses/update', {status: toPost},  function(error, tweet, response){
                        if(error){
                          console.log(error);
                        }
                        console.log(tweet);  // Tweet body.
                        console.log(response);
                        return res.send('New tweet, YAY!');  // Raw response object.
                    }); 
                } else {
                    // Try with the next Reddit Post.
                    return res.send('Will try with another post');
                }
            })
        }
    });
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
