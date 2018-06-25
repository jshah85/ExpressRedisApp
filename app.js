/**
 * Created by jshah on 6/24/2018.
 */

var app = require("express")();
var bodyParser = require('body-parser');
var sha256 = require('js-sha256').sha256;

// heroku redis connection
// var client = require('redis').createClient(process.env.REDIS_URL);

// local redis connection
var client = require('redis').createClient();

app.use(bodyParser.json()); // for parsing application/json

client.on('connect', function() {
    console.log('Connected to Redis');
});

// Root page
app.get("/", function(req, res){
    res.send("Hello, World!");
});

// GET message from given SHA256
app.get('/messages/:hashId', function(req, res){

    var hashId = req.params.hashId;
    console.log(hashId);

    client.get(hashId, function(err, reply) {

        console.log(reply);
        console.log(err);

        if(err){
            var returnObj = {
                "err_msg": "Message not found"
            };
            res.json(returnObj);
            return;
        }

        if(reply !== ""){
            var returnObj = {
                "message": reply
            };
            res.json(returnObj);
            return;
        }
    });
});

// POST new message
app.post('/messages', function (req, res) {

    // extract message from request
    var strMessage = req.body.message;

    // convert to SHA256 in hex form
    var digestedMsg = sha256(strMessage);

    // store to redis client
    client.set(digestedMsg, strMessage, function(err, reply) {
        console.log(err);
        console.log(reply);
    });

    // send digest back in response
    var returnObj = {
        "digest": digestedMsg
    };
    res.json(returnObj);
});

app.listen(3000);

console.log("Server ready...");




