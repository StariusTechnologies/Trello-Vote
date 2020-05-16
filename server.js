var express = require('express');
var cors = require('cors');

var app = express();

app.use(cors({origin: 'https://trello.com'}));
app.use(express.static('public'));

app.get('/configuration', function (request, response) {
    response.sendFile(__dirname + '/views/configuration.html');
});

app.get('/vote', function (request, response) {
    response.sendFile(__dirname + '/views/vote.html');
});

app.get('/results', function (request, response) {
    response.sendFile(__dirname + '/views/results.html');
});

app.get('*', function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
