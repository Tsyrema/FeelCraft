var express = require('express');
var twilio= require('twilio');
const language = require('@google-cloud/language');
var keys = require('./keys.json');
var bodyParser = require('body-parser')
var app = express();


var twilioClient = new twilio(keys.twilioSID, keys.twilioToken);
var client = new language.LanguageServiceClient();

const negative = 0.5;
const positive = -0.4;
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.post('/',function(req,res){
  var conversation = req.body.data;
  //var phoneNumber = req.body.phoneNumber;
  var query = {
    type:"PLAIN_TEXT",
    language: "EN",
    content: conversation
  };
  var docSentiment;
  var docEntity;

  client.analyzeSentiment({document: query})
    .then(function(results) {
      docSentiment= results[0].documentSentiment;
      client.analyzeEntities({document: query})
        .then(function(results) {
          var temp = results[0];
          docEntity= temp.entities[0].name;
        })
        .then(function(){

        })
        .catch(function(err){
          console.error('ERROR:', err);
        });

    })
    .catch(function(err){
      console.error('ERROR:', err);
    });


});



var port= 8080;
app.listen(port);
