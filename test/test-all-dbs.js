var couchr = require('couchr'),
    async = require('async'),
    environment = require('../lib/environment'),
    config = require('../lib/config'),
    app = require('../lib/app'),
    path = require('path'),
    url = require('url'),
    utils = require('./lib/utils');

exports.setUp = function (callback) {
  var that = this;
  var project_dir = path.resolve(__dirname, 'fixtures/project1');
  var cfg = environment.getConfig(
    process.platform,   // platform
    process.env,        // environment vars
    project_dir,        // project directory
    []                  // command-line arguments
  );
  cfg.admin_password = 'testing';
  utils.resetFixture(project_dir, function (err) {
    app.init(cfg, function (err) {
      if (err) {
        return callback(err);
      }
      that.config = cfg;
      return callback();
    });
  });
};

exports.tearDown = function (callback) {
  app.stop(this.config, callback);
};

exports['www server _all_dbs unauthorized when not admin'] = function (test) {
  var u = 'http://127.0.0.1:' + this.config.www_port + '/_api/_all_dbs';
  couchr.get(u, function (err, data, res) {
    test.equal(res.statusCode, 401);
    test.ok(data.error);
    test.done();
  });
};

exports['www server _all_dbs authorized when admin'] = function (test) {
  var cfg = this.config;
  config.getCouchCredentials(cfg, function (err, username, password) {
    var u = 'http://127.0.0.1:' + cfg.www_port + '/_api/_all_dbs';
    var parsed = url.parse(u);
    parsed.auth = username + ':' + password;
    u = url.format(parsed);
    couchr.get(u, function (err, data, res) {
      test.equal(res.statusCode, 200);
      test.done();
    });
  });
};

exports['admin server _all_dbs unauthorized when not admin'] = function (test) {
  var u = 'http://127.0.0.1:' + this.config.admin_port + '/_api/_all_dbs';
  couchr.get(u, function (err, data, res) {
    test.equal(res.statusCode, 401);
    test.ok(data.error);
    test.done();
  });
};

exports['admin server _all_dbs authorized when admin'] = function (test) {
  var cfg = this.config;
  config.getCouchCredentials(cfg, function (err, username, password) {
    var u = 'http://127.0.0.1:' + cfg.admin_port + '/_api/_all_dbs';
    var parsed = url.parse(u);
    parsed.auth = username + ':' + password;
    u = url.format(parsed);
    couchr.get(u, function (err, data, res) {
      test.equal(res.statusCode, 200);
      test.done();
    });
  });
};
