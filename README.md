## Transport Locomote Code Challenge

#### Errata:
1. If you don't select the airport from the dropdown lists, the form will not allow you to submit it (disabled button). With more time, it would be nice to fetch the airport given just a three-letter code in the text field and use that on blur.
2. I made some incorrect assumption about momentJS, which I'd never used before today, and sometimes the middle tab displays the wrong date (i.e. things are offset by a day one direction or the other from the date selected in the date picker). Time zones are a tricky deal! Just what you wanna hear from someone half way 'round the world looking for a remote job I'm sure!
3. Server-side error handling is slim to none. The solution of counting responses until all the airlines are accounted for is janky at best. There would certainly be a more elegant way to handle this, possibly using .catch on the promises or at least dealing with timeouts, errors back from FlightAPI, etc.
4. Currently the /search endpoint will conduct searches against the FlightAPI even for dates that have past, simply returning an empty array of flights, but only after calling out once for each airline. A check could be done to see if date has passed, and this could be avoided. I figured on a hig degreee of error going this route, as I might easily lose the ability to search dates that haven't yet passed due to error in time zone conversion, left it doing the "simple" thing with the correct result rather than the efficient thing.
