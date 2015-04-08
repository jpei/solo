var util = require('./utility');

exports.renderIndex = function(req, res) {
  res.redirect('/index.html');
};
exports.renderCrime = function(req, res) {
  var timeUnit = req.url.slice(7);

  util.lastUpdatedDate(function(date) {
    util.query({
      dstart: Date.parse(date) - util[timeUnit](),
      dend: Date.parse(date)-util.day(),
      callback: function(data, done) {
        res.write(data);
        if (done) {
          res.end();
        }
      },
      continue: true
    });
  });
};
