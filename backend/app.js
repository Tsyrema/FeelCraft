var express = require('express');
var twilio = require('twilio');
const language = require('@google-cloud/language');
var keys = require('./keys.json');
var bodyParser = require('body-parser')
var giphy = require('giphy-api')(keys.giphy);
var app = express();

var twilioClient = new twilio(keys.twilioSID, keys.twilioToken);
var client = new language.LanguageServiceClient();

const positive = 0.3;
const negative = -0.3;

app.use(function(req, res, next) {
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

app.post('/', function(req, res) {
  var conversation = req.body.data;
  var phoneNumber = req.body.phoneNumber;
  var query = {
    type: "PLAIN_TEXT",
    language: "EN",
    content: conversation
  };
  var docSentiment;
  var docEntity;

  client.analyzeSentiment({
      document: query
    })
    .then(function(results) {
      docSentiment = results[0].documentSentiment;
      client.analyzeEntities({
          document: query
        })
        .then(function(results) {
          var temp = results[0];
          docEntity = temp.entities[0].name;
        })
        .then(function() {
          if(docSentiment.score<= negative){
            docEntity+=" sad";
          }
          console.log(docEntity);
          console.log(docSentiment);
          giphy.search({
            q: docEntity,
            rating: 'g',
            limit: 5,
          }, function(err, response) {
             var ran= Math.floor(Math.random() * Math.floor(5));
             var data = response.data[ran];
             console.log(data);
             sendText(phoneNumber,data)
             res.json({
               success:"true"
             })
          });

        })
        .catch(function(err) {
          res.json({
            success:"false",
            error: err
          })
        });

    })
    .catch(function(err) {
      res.json({
        success:"false",
        error: err
      })
    });


});
async function sendText(phoneNumber, data){
  twilioClient.messages.create({
      body: data.title,
      to: phoneNumber,
      from: '+18035003905',
      mediaUrl: data.images.downsized.url
    })
    .then( function(message){
        console.log(message);
    })
    .catch(function(err){
      console.log(err);
    })
  }


var port = 8080;
app.listen(port);
