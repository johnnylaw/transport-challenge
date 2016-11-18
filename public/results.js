$(function() {
  var durationString = function(minutes) {
    var hours = parseInt(minutes / 60);
    var minutes = minutes % 60;
    return hours.toString() + 'h' + minutes.toString().replace(/^([\d])$/, "0$1") + 'm';
  };

  var showResults = function(results, tabNumber) {
    var list = $('#day-' + tabNumber + ' ul.results-list');
    list.html('');

    if (results.length > 0) {
      results.forEach(function(result) {
        var row = $('<li class="row">');
        var div = $('<div class="col-md-2 col-xs-4">');
        div.html(result.airline.name + '<br />' + result.airline.code + result.flightNum);
        row.append(div);

        var format = {
          date: 'MMM D ',
          time: 'h:mm a'
        };

        var start = moment(new Date(result.start.dateTime)).tz(result.start.timeZone);
        div = $('<div class="col-md-2 col-xs-4">');
        div.html('Dpt ' + result.start.airportCode + '<br />' + start.format(format.date) + '<br />' + start.format(format.time));
        row.append(div);

        var finish = moment(new Date(result.finish.dateTime)).tz(result.finish.timeZone)
        div = $('<div class="col-md-2 col-xs-4">');
        div.html('Arr ' + result.finish.airportCode + '<br />' + finish.format(format.date) + '<br />' + finish.format(format.time));
        row.append(div);

        div = $('<div class="clearfix visible-xs-block visible-sm-block">');
        div.html('<br />');
        row.append(div);

        div = $('<div class="col-md-2 col-xs-4">');
        div.html('Duration<br />' + durationString(result.durationMin));
        row.append(div);

        div = $('<div class="col-md-2 col-xs-4">');
        div.html(result.plane.shortName.split(' ').join('<br />'));
        row.append(div);

        div = $('<div class="col-md-2 col-xs-4">');
        div.html('<br />$' + parseInt(result.price));
        row.append(div);

        list.append(row)
      });
    } else {
      var row = $('<li class="row">');
      var div = $('<div class="col-md-12">');
      div.html('<p>No results to show</p>');
      row.append(div);
      list.append(row);
    }
  };

  var searchAndReportForDate = function(date, tabNumber) {
    var fancyWaitingAnimation = $('#day-' + tabNumber + ' .waiting');
    fancyWaitingAnimation.removeClass('hidden');

    $.ajax({
      url: '/search',
      method: 'GET',
      data: {
        date: date.format('YYYY-MM-DD'),
        from: $('#from-airport').data('code'),
        to: $('#to-airport').data('code')
      },
      success: function(flights) {
        fancyWaitingAnimation.addClass('hidden');
        console.log(flights.length);
        showResults(flights, tabNumber);
      }
    });
  };

  var writeTabTitles = function(date, tabNumber) {
    $('#tab-' + tabNumber + ' a').html(date.format('MMM D'));
  };

  $('#search-button').on('click', function() {
    $('#search-results').removeClass('hidden');

    $('ul.results-list').html('');

    var originatingAirportTimeZone = $('#from-airport').data('timeZone');
    const baseDate = new Date($('#date-of-travel').val());
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    [0, -1, 1, -2, 2].forEach(function(offset) {
      var tabNumber = offset + 2;
      var date = moment(new Date(baseDate.getTime() + offset * millisecondsPerDay));

      if(originatingAirportTimeZone !== undefined) {
        date = date.tz(originatingAirportTimeZone);
      }

      searchAndReportForDate(date, tabNumber);
      writeTabTitles(date, tabNumber);
    });
  });

  $('#tabs').tabs({
    active: 2,
  });
});