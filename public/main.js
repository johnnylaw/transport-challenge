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
      checkForm();
    }
  });

  var checkForm = function() {
    var complete = true;
    $('#from-airport, #to-airport').each(function() {
      var airportCode = $(this).data('code');
      if (airportCode === undefined || airportCode.length != 3) complete = false;
    });

    console.log("airports:", complete);
    var date = $('#date-of-travel').val();
    complete = complete && date.match(/^[\d]{4}-[\d]{2}-[\d]{2}$/);
    console.log("date:", complete);

    $('#search-button').attr('disabled', !complete);
  }

  var dateOfTravel = $('#date-of-travel').datepicker({
    minDate: new Date(),
    dateFormat: 'yy-mm-dd',
    onSelect: checkForm
  });
  $('#from-airport').select();
});