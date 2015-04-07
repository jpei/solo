var request = require('request');
var _ = require('underscore');

exports.lastUpdatedDate = function(callback) {
  exports.query(Date.now()-exports.year(), null, 1, function(crimeData) {
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

exports.query = function(dstart, dend, count, callback) {
  dstart = dstart || Date.now()-exports.month();
  dend = dend || Date.now();
  count = count || 100000;

  var options = {
    url: 'http://sanfrancisco.crimespotting.org/crime-data.php',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    qs: {
      format: 'json',
      count: count,
      dstart: exports.toDateString(dstart),
      dend: exports.toDateString(dend)
    }
  };
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('Failed to get statistics: ', error || response.statusCode);
    } else {
      callback(_.map(JSON.parse(body).features, function(feature) {
        return [feature.properties.date_time, feature.properties.description];
      }));
    }
  });
};

exports.toDateObj = function(date) {
  if (typeof date === 'string') {
    var dateArray = date.split(/-| |:/); // Parse via splitting on '-', ' ', and ':'
    dateArray[1] = +dateArray[1]-1; // Convert month to 0-11
    dateArray.unshift(Date); // Add something as context
    return new (Date.bind.apply(Date, dateArray));
  } else {
    return new Date(date);
  }
};

exports.toDateString = function(date) {
  var dateObj = exports.toDateObj(date);
  var dateYear = dateObj.getUTCFullYear();
  var dateMonth = dateObj.getUTCMonth()+1 < 10 ? '0'+(dateObj.getUTCMonth()+1) : dateObj.getUTCMonth()+1;
  var dateDate = dateObj.getUTCDate() < 10 ? '0'+dateObj.getUTCDate() : dateObj.getUTCDate();
  return dateYear+'-'+dateMonth+'-'+dateDate;
};
