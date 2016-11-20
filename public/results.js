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
    var airports = {
      from: $('#from-airport').data().airport,
      to: $('#to-airport').data().airport
    };

    var fancyWaitingAnimation = $('#day-' + tabNumber + ' .waiting');
    fancyWaitingAnimation.removeClass('hidden');

    $.ajax({
      url: '/search',
      method: 'GET',
      data: {
        date: date.format('YYYY-MM-DD'),
        from: airports.from.airportCode,
        to: airports.to.airportCode
      },
      success: function(flights) {
        fancyWaitingAnimation.addClass('hidden');
        showResults(flights, tabNumber);
      }
    });
  };

  var writeTabTitles = function(date, tabNumber, past) {
    var tab = $('#tab-' + tabNumber + ' a');
    if (past) {
      tab.html('Past');
      tab.addClass('past');
    } else {
      tab.html(date.format('MMM D'));
      tab.removeClass('past');
    }
  };

  $('#search-button').on('click', function() {
    $('#search-results').removeClass('hidden');

    $('ul.results-list').html('');

    var originatingAirportTimeZone = $('#from-airport').data().airport.timeZone;
    var dateString = $('#date-of-travel').val();
    var baseDate = moment.tz(dateString, originatingAirportTimeZone);
    window.date = baseDate;

    [0, -1, 1, -2, 2].forEach(function(offset) {
      var tabNumber = offset + 2;
      var date = baseDate.clone().add(offset, 'd');
      var past = date.endOf('d') <= moment();
      if (!past) {
        searchAndReportForDate(date, tabNumber);
      }
      writeTabTitles(date, tabNumber, past);
    });
  });

  $('#tabs').tabs({
    active: 2,
  });
});