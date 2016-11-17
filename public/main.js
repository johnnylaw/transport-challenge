$(function() {
  var timeOfLastSuccessfulAirportRequest = new Date();

  $('#from-airport, #to-airport').autocomplete({
    source: function(request, response) {
      request.time = new Date();
      $.ajax({
        url: '/airports',
        method: 'get',
        data: { q: request.term },
        success: function(data) {
          if (request.time >= timeOfLastSuccessfulAirportRequest) {
            timeOfLastSuccessfulAirportRequest = request.time;
            var names = data.map(function(airport) {
              return airport.airportCode + ' (' +
                airport.airportName + ', ' +
                airport.countryName + ')';
            });
            response(names);
          }
        }
      });
    },
    minLength: 2
  });

  $('#from-airport').select();
});