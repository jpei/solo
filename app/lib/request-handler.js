var util = require('./utility');

exports.renderIndex = function(req, res) {
  res.sendFile('/index.html');
};
exports.renderCrime = function(req, res) {
  var timeUnit = req.url.slice(7);

  util.lastUpdatedDate(function(date) {
    res.setHeader('Content-Type', 'application/json');
    util.query({
      dstart: Date.parse(date) - util[timeUnit](),
      dend: Date.parse(date)-util.day(),
      callback: function(data, done) {
        res.write(JSON.stringify(data));
        if (done) {
          res.end();
        }
      },
      again: true
    });
  });
};
