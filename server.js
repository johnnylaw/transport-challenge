var express = require('express');
var proxy = require('express-http-proxy');
var app = express();
var path = require('path');
var request = require('request');
var _ = require('lodash');

const calloutOptions = {
  host: 'node.locomote.com'
};

const transportHost = 'http://node.locomote.com/code-task';

app.use(express.static(path.join(__dirname, 'public')));

app.use('/airports', proxy('node.locomote.com', {
  forwardPath: function(request, response) {
    return '/code-task/airports' + require('url').parse(request.url).search;
  }
}));

app.use('/airlines', proxy('node.locomote.com', {
  forwardPath: function(request, response) {
    return '/code-task/airlines';
  }
}));

var getAirlines = function() {
  return new Promise(function(resolve, reject) {
    var airlinesPath = '/code-task/airlines';
    var options = _.merge(calloutOptions, { path: airlinesPath });

    var callback = function(error, response, body) {
      resolve(JSON.parse(body));
    };

    request({
      url: transportHost + '/airlines'
    }, callback);
  });
};

var getFlights = function(airlines, query) {
  return new Promise(function(resolve, reject) {
    var flights = [];
    var responseCount = 0;

    airlines.forEach(function(airline) {
      var callback = function(error, response, body) {
        responseCount += 1;

        if (response.statusCode === 200) {
          var newFlights = JSON.parse(body);
          flights = flights.concat(newFlights);
          if (responseCount == airlines.length) {
            resolve(flights);
          }
        } else {
          resolve([]);
        }
      };

      var url = transportHost + '/flight_search/' + airline.code;
      request({
        url: url,
        qs: query
      }, callback);
    });
  });
};

app.get('/search', function(request, response) {
  var query = _.pick(request.query, ['date', 'from', 'to']);

  getAirlines().then(function(airlines) {
    return getFlights(airlines, query);
  }).then(function(flights) {
    response.json(flights.sort(function(a, b) {
      return a.price - b.price;
    }));
  });
});

var server = app.listen(3000, function() {
  console.log('Started server on port ' + server.address().port);
});
