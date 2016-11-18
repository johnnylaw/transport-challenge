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

  var adjustCalendar = function() {
    var timeZone = $('#from-airport').data('timeZone');
    if (timeZone !== undefined) {
      var dateAtOrigin = moment(new Date()).tz(timeZone);
      var [year, month, day] = [dateAtOrigin.year(), dateAtOrigin.month(), dateAtOrigin.date()];
      dateOfTravel.datepicker('option', 'minDate', new Date(year, month, day));
    }
  }

  var checkForm = function() {
    var complete = true;

    $('#from-airport, #to-airport').each(function() {
      var airportCode = $(this).data('code');
      if (airportCode === undefined || airportCode.length != 3) complete = false;
    });

    complete = complete && $('#date-of-travel').val().match(/^[\d]{4}-[\d]{2}-[\d]{2}$/);

    $('#search-button').attr('disabled', !complete);

    adjustCalendar();
  }

  var dateOfTravel = $('#date-of-travel');
  dateOfTravel.datepicker({
    minDate: new Date(),
    dateFormat: 'yy-mm-dd',
    onSelect: function() {
      checkForm();
    }
  });

  $('#from-airport').select();
});