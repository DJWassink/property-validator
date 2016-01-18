var assert = require('assert');

var express = require('express');
var request = require('supertest');

var assertAll = require('../lib/request_assertions').assertAll;
var middleware = require('../lib/middleware');
var presence = require('../lib/validations').presence;
var email = require('../lib/validations').email;

describe('Validation Middleware', function() {

  describe('intercepting invalid requests', function() {
    var app;

    app = express();
    app.get('/hello', function(req, res){
      assertAll(req, [
        presence('username'),
        email('email_address')
      ]);

      res.status(200).json({ name: 'netto' });
    });

    app.use(middleware);

    it('sends the appropriate response code', function(done) {
      var response = request(app).get('/hello');
      response.expect(422, done);
    });

    it('sends all errors back in the response', function(done) {
      var response = request(app).
        get('/hello').
        set('Accept', 'application/json');


      var expectedResponse = {
        errors: [
          '"username" required',
          '"email_address" should look like an email address',
        ]
      };

      response.expect('Content-type', /json/);
      response.expect(422, expectedResponse, done);
    });

    it('respects the content type', function(done) {
      var response = request(app).get('/hello');
      response.expect('Content-type', 'text/plain; charset=utf-8');

      var expectedResponse = 'Invalid Request: "username" required, "email_address" should look like an email address';

      response.expect(422, expectedResponse, done);
    });
  });
});
