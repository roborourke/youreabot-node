// server.js
// where your node app starts

// init project
var express = require('express');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var retort = require('./scathing-retort');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// textrazor
var textrazorKey = process.env.TEXTRAZOR_KEY || '';

// slack rtm client
var RtmClient = require('@slack/client').RtmClient;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var slackToken = process.env.SLACK_API_TOKEN || '';
var rtm = new RtmClient(slackToken, {
  //logLevel: 'debug', 
  datastore: new MemoryDataStore()
});
rtm.start();

// events
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;

// you need to wait for the client to fully connect before you can send messages
rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
  rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    // attempt to parse and reply on a probability scale eg 10% of messages
    if ( Math.random() > 0.75) {
      
      var user = rtm.dataStore.getUserById(message.user);
      
      retort(message.text, function(insult) {
        if ( insult ) {
          rtm.sendMessage('<@' + message.user + '|' + user.name + '> ' + insult, message.channel);
        }
      });
      
    }
  });
});

rtm.on(RTM_CLIENT_EVENTS.DISCONNECT, function() {
  rtm.start();
});


// Use handlebars view engine
var hbsConfig = handlebars.create( {
  defaultLayout: 'main',
  compilerOptions: {
    data: {
      title: "You're a Bot"
    }
  }
} );
app.engine('handlebars', hbsConfig.engine );
app.set('view engine', 'handlebars');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  var text = request.query.text || false;
  retort(text, function(insult){
    response.render('index', { retort: insult });
  });
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/", function (request, response) {
  var text = request.query.text || false;
  retort(text,function(insult){
    response.json(insult);
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});