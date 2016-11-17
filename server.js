var express = require('express');
var proxy = require('express-http-proxy');
var app = express();
var path = require('path');

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

var server = app.listen(3000, function() {
  console.log('Started server on port ' + server.address().port);
});
