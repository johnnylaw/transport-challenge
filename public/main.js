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
            data.forEach(function(airport) {
              airport.label = airport.airportCode + ' (' +
                airport.airportName + ', ' +
                airport.countryName + ')';
            });
            response(data);
          }
        }
      });
    },
    minLength: 2,
    select: function(event, ui) {
      $(this).data({
        timeZone: ui.item.timeZone,
        code: ui.item.airportCode
      });
    }
  });

  $('#from-airport').select();

  var dateOfTravel = $('#date-of-travel').datepicker({
    minDate: new Date(),
    dateFormat: 'yy-mm-dd'
  });
});