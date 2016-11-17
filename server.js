var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(3000, function() {
  console.log('Started server on port ' + server.address().port);
});
