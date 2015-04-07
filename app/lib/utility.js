var request = require('request');
var _ = require('underscore');
var parseString = require('xml2js').parseString;

exports.lastUpdatedDate = function(callback) {
  exports.query('xml', Date.now()-exports.year(), null, 1, function(crimeData) {
    callback(crimeData[0][0].split(' ')[0]); // returns YYYY-MM-DD
  });
};
exports.hour = function() {
  return 60*60*1000;
};
exports.day = function() {
  return 24*exports.hour();
};
exports.week = function() {
  return 7*exports.day();
};
exports.month = function() {
  return 30*exports.day();
};
exports.year = function() {
  return 365*exports.day();
};

exports.query = function(format, dstart, dend, count, callback) {
  format = format || 'xml';
  dstart = dstart || Date.now()-exports.month();
  dend = dend || Date.now();
  count = count || 100000;

  var options = {
    url: 'http://sanfrancisco.crimespotting.org/crime-data.php',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    qs: {
      format: format,
      count: count,
      dstart: exports.toDateString(dstart),
      dend: exports.toDateString(dend)
    }
  };
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('Failed to get statistics: ', error || response.statusCode);
    } else {
      if (format === 'json') {
        callback(_.map(JSON.parse(body).features, function(feature) {
          return [feature.properties.date_time, feature.properties.description];
        }));
      } else if (format === 'xml') { // Requesting xml and parsing it to json is faster
        parseString(body, function(err, result) {
          if (error) {
            console.error('Failed to parse xml: ', error);
          } else {
            callback(_.map(result.reports.report, function(report) {
              return [report.$.date_time, report._];
            }));
          }
        });
      } else {
        console.error('Unknown format: ', error);
      }
    }
  });
};

exports.toDateObj = function(date) {
  var parseable = Date.parse(date);
  if (parseable === parseable) {
    return new Date(date);
  } else if (typeof date === 'string') {  // if parseable is NaN -> date is not parseable
    var dateArray = date.split(/-| |:/); // Parse via splitting on '-', ' ', and ':'
    dateArray[1] = +dateArray[1]-1; // Convert month to 0-11
    dateArray.unshift(Date); // Add something as context
    return new (Date.bind.apply(Date, dateArray))();
  } else if (typeof date === 'number') {
    return new Date(date);
  } else {
    console.error('Error: Cannot parse date');
  }
};

exports.toDateString = function(date) {
  var dateObj = exports.toDateObj(date);
  var dateYear = dateObj.getUTCFullYear();
  var dateMonth = dateObj.getUTCMonth()+1 < 10 ? '0'+(dateObj.getUTCMonth()+1) : dateObj.getUTCMonth()+1;
  var dateDate = dateObj.getUTCDate() < 10 ? '0'+dateObj.getUTCDate() : dateObj.getUTCDate();
  return dateYear+'-'+dateMonth+'-'+dateDate;
};
