const Twit = require("twit");
const fs = require("fs");
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.sendStatus(200));
app.listen(port, () => console.log(`Listening on port ${port}!`));

require("dotenv").config();

const quotebot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

const request = require('request')
const url = 'url'

// use a timeout value of 10 seconds
const timeoutInMilliseconds = 10 * 1000
const opts = {
  url: url,
  timeout: timeoutInMilliseconds
}

setInterval(function () {
  
  request(opts, function (err, res, body) {

    if (err) {
      console.dir(err)
      return
    }

    let statusCode = res.statusCode
    console.log('status code: ' + statusCode)
  });

// render apps spin down after 15 minutes
// access render's deployed website every 14 min for the bot to always be available
}, 1000 * 60 * 14);

// Setting up a user stream
const stream = quotebot.stream('statuses/filter', { 
  track: "account" 
});

// looking for Tweet events
stream.on('tweet', pressStart);

function getLine() {

  let data = fs.readFileSync('sub.txt', 'utf8');
  let readMe = data.split(/\r?\n/);
  let lineCount = readMe.length;
  let randomLineNumber = Math.floor(Math.random() * lineCount);
  let randomLine = readMe[randomLineNumber];

  console.log(randomLine);

  return randomLine;
}

function pressStart(tweet) {

  let id = tweet.id_str;
  let text = tweet.text;
  let name = tweet.user.screen_name;

  quotebot.get('statuses/show/:id', { 
    id: tweet.in_reply_to_status_id_str 
  });

  if (text.includes("account") && (text.includes("quote") || text.includes("Quote") || text.includes("QUOTE"))) {

    // get line from text file and compose corresponding tweet
    let line = getLine();
    let replyText = ("@" + name + " " + line);

    // reply to sender
    quotebot.post('statuses/update', { 
      status: replyText, in_reply_to_status_id: id
    });

    console.log("replied to quote request!");

  } else {
    console.log("quote was not triggered!");
  };
}
