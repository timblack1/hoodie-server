/**
 * Serves the API, proxying relevant requests to CouchDB
 */

var couch = require('../couch'),
    quip = require('quip'),
    _ = require('underscore');


module.exports = function (config) {
  var proxy = couch.proxy(config);

  return function (req, res, next) {
    // ignore non-api requests
    if (!/^\/_api/.test(req.url)) {
      return next();
    }

    // remove the /_api part from url before proxying
    var url = req.url.substr('/_api'.length);

    if (/^\/_all_dbs\/?.*/.test(url)) {
      couch.getUserCtx(config, req, function (err, userctx) {
        if (err) {
          console.error(err);
          quip(res).unauthorized().json({
            error: 'couldn\'t check couch session'
          });
        }
        else {
          if (_.contains(userctx.roles, '_admin')) {
            // proxy request to CouchDB
            proxy(url, req, res);
          }
          else {
            quip(res).unauthorized().json({
              error: 'only admins can access _all_dbs'
            });
          }
        }
      });
    }
    else {
      // proxy request to CouchDB
      proxy(url, req, res);
    }
  };
};
