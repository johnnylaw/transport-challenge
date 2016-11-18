$(function() {
  var timeOfLastSuccessfulAirportRequest = new Date();

  function requestIsMostRecent(request) {
    var isMostRecent = request.time >= timeOfLastSuccessfulAirportRequest;
    if (isMostRecent) {
      timeOfLastSuccessfulAirportRequest = request.time;
    }
    return isMostRecent;
  }

  function airportDisplayName(airport) {
    return airport.label = airport.airportCode + ' (' +
      airport.airportName + ', ' +
      airport.countryName + ')';
  }

  function bubbleAirportCodeToTop(airports, searchString) {
    airports.sort(function(a, b) {
      if (a.airportCode === searchString) return -1;
      else if (b.airportCode === searchString) return 1;
      return 0;
    });
  }

  $('#from-airport, #to-airport').autocomplete({
    source: function(request, response) {
      request.time = new Date();

      $.ajax({
        url: '/airports',
        method: 'get',
        data: { q: request.term },
        success: function(data) {
          if (requestIsMostRecent(request)) {
            data.forEach(function(airport) {
              airport.label = airportDisplayName(airport);
            });
            bubbleAirportCodeToTop(data, request.term.toUpperCase());
            response(data);
          }
        }
      });
    },
    minLength: 2,
    select: function(event, ui) {
      $(this).data({ airport: ui.item });
      checkForm();
    }
  });

  function adjustCalendar() {
    var originatingAirport = $('#from-airport').data().airport;
    if (originatingAirport !== undefined) {
      var date = moment.tz(originatingAirport.timeZone);
      dateOfTravel.datepicker('option', 'minDate', date.format('YYYY-MM-DD'));
    }
  }

  var checkForm = function() {
    var complete = true;

    $('#from-airport, #to-airport').each(function() {
      var airport = $(this).data().airport;
      if (airport === undefined || airport.airportCode.length != 3) complete = false;
    });

    complete = complete && $('#date-of-travel').val().match(/^[\d]{4}-[\d]{2}-[\d]{2}$/);

    $('#search-button').attr('disabled', !complete);

    adjustCalendar();
  }

  var dateOfTravel = $('#date-of-travel');
  dateOfTravel.datepicker({
    minDate: new Date(),
    dateFormat: 'yy-mm-dd',
    onSelect: checkForm
  });

  $('#from-airport').select();
});