var request = require('request');
var parseString = require('xml2js').parseString;

exports.lastUpdatedDate = function(callback) {
  exports.query({
    count: 1,
    callback: function(crimeData) {
      callback(crimeData[0][0][0]);
    }
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
  return 28*exports.day(); // Written in terms of weeks to support analysis per day of week
};
exports.year = function() {
  return 364*exports.day();
};

exports.query = function(params) {
  // format, dstart, dend, count, offset, callback, again
  params = params || {};
  params.format = params.format || 'json';
  params.dstart = params.dstart || Date.now()-exports.year();
  params.dend = params.dend || Date.now();
  params.count = params.count || 1000;
  params.offset = params.offset || 0;
  params.callback = params.callback || function() {};
  params.again = params.again || false;

  var options = {
    url: 'http://sanfrancisco.crimespotting.org/crime-data.php',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    qs: {
      format: params.format,
      dstart: toDateString(params.dstart),
      dend: toDateString(params.dend),
      count: params.count,
      offset: params.offset
    }
  };
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('Failed to get statistics: ', error || response.statusCode);
    } else {
      if (params.format === 'json') {
        handleData(JSON.parse(body).features, function(report) {
          return [report.properties.date_time.split(' '), report.properties.description, report.properties.crime_type];
        }, params);
      } else if (params.format === 'xml') { // Requesting xml and parsing it to json may be faster
        parseString(body, function(err, result) {
          if (error) {
            console.error('Failed to parse xml: ', error);
          } else {
            handleData(result.reports.report, function(report) {
              var dateTimeParts = report.$.date_time.split('T');
              return [[dateTimeParts[0], dateTimeParts[1].slice(0,8)], report._, report.$.crime_type];
            }, params);
          }
        });
      } else {
        console.error('Unknown format: ', error);
      }
    }
  });
};

var handleData = function(reports, parseReport, params) {
  var done = reports.length < params.count;
  params.callback(reports.map(parseReport), done);
  if (!done && params.again) {
    params.offset += params.count;
    exports.query(params);
  }
};

var toDateObj = function(date) {
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

var toDateString = function(date) {
  var dateObj = toDateObj(date);
  var dateYear = dateObj.getUTCFullYear();
  var dateMonth = dateObj.getUTCMonth()+1 < 10 ? '0'+(dateObj.getUTCMonth()+1) : dateObj.getUTCMonth()+1;
  var dateDate = dateObj.getUTCDate() < 10 ? '0'+dateObj.getUTCDate() : dateObj.getUTCDate();
  return dateYear+'-'+dateMonth+'-'+dateDate;
};
