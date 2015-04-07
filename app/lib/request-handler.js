var util = require('./utility');

exports.renderIndex = function(req, res) {
  res.redirect('/index.html');
};
exports.renderCrime = function(req, res) {
  var timeUnit = req.url.slice(7);

  util.lastUpdatedDate(function(date) {
    util.query('xml', Date.parse(date) - util[timeUnit](), Date.parse(date)-util.day(), 100000, function(data) { // Offset of 1 day to ensure full days
      res.json(data);
    });
  });
};
