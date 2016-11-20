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
    searchString = searchString.toUpperCase().substring(0,3);
    if (airports.length === 0) return undefined;
    airports.sort(function(a, b) {
      if (a.airportCode === searchString) return -1;
      else if (b.airportCode === searchString) return 1;
      return 0;
    });
    var airport = airports[0];
    if (airport.airportCode === searchString.toUpperCase()) {
      return airport;
    }
  }

  function ensureAirportInField($textField) {
    var data = $textField.data();
    var airport = data.airport;
    var possibleAirport = data.possibleAirport;

    if (!airport) {
      if (possibleAirport) {
        $textField
        .data({ airport: possibleAirport })
        .val(airportDisplayName(possibleAirport));
      }
      $textField.toggleClass('error', !possibleAirport);
    }
  }

  function resetTextFieldAirport($textField) {
    $textField.data({ airport: null, possibleAirport: null });
  }

  $('#from-airport, #to-airport').on('blur', function() {
    ensureAirportInField($(this));
  }).autocomplete({
    source: function(request, response) {
      var $textField = this.element;
      resetTextFieldAirport($textField);
      request.time = new Date();

      var ajaxSuccess = function(data) {
        if (requestIsMostRecent(request)) {
          data.forEach(function(airport) {
            airport.label = airportDisplayName(airport);
          });
          var airportWithMatchingCode = bubbleAirportCodeToTop(data, request.term);

          response(data);

          if (airportWithMatchingCode) {
            $textField.data({ possibleAirport: airportWithMatchingCode });
            if (!$textField.is(':focus')) ensureAirportInField($textField);
          }
        }
      };

      $.ajax({
        url: '/airports',
        method: 'get',
        data: { q: request.term },
        success: ajaxSuccess
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
    var airportsComplete = true;

    $('#from-airport, #to-airport').each(function() {
      var airport = $(this).data().airport;
      if (!airport || airport.airportCode.length != 3) complete = false;
    });

    var $calendar = $('#date-of-travel');
    var calendarComplete = $calendar.val().match(/^[\d]{4}-[\d]{2}-[\d]{2}$/);
    $calendar.toggleClass('error', !calendarComplete);

    $('#search-button').attr('disabled', !airportsComplete || !calendarComplete);

    adjustCalendar();
  }

  var dateOfTravel = $('#date-of-travel');
  dateOfTravel.datepicker({
    minDate: new Date(),
    dateFormat: 'yy-mm-dd',
    onClose: checkForm
  });

  $('#from-airport').select();
});