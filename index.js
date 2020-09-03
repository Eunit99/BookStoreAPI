/*
Primary file for the API
*/

//dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var userHandler = require('./lib/user_handler');
var routeHandler = require('./lib/book_handler');
var helper = require('./lib/helper');
var config = require('./lib/config');
var fs = require('fs');

var server = http.createServer(function(req, res) {

    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    var queryStringObject = parsedUrl.query;

    var method = req.method.toLowerCase();

    var header = req.headers;

    //Get Payload
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notfound;

        var data = {
            'trimmedPath': trimmedPath,
            'query': queryStringObject,
            'method': method,
            'headers': header,
            'payload': helper.parseJsonToObject(buffer)
        };

        chosenHandler(data, function(statusCode, payload) {

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            payload = typeof(payload) == 'object' ? payload : {};

            var responseObj = JSON.stringify(payload);

            res.setHeader('Content-Type', "application/json");
            res.writeHead(statusCode);

            res.write(responseObj);
            res.end();

            console.log('request received with this response', statusCode, responseObj);
        });
    });
});

//start the server
server.listen(config.port, function() {
    console.log("Server started on PORT " + config.port + " in " + config.envName + " mode");
})


var router = {
    'ping': routeHandler.ping,
    'users': userHandler.users,
    'books': routeHandler.books,
    'notfound': routeHandler.notfound,
    'tokens': userHandler.tokens
}