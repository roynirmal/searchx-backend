'use strict';

// Default to testing environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment configurations
const config = require('../app/config/config');

// Load dependencies
const supertest = require('supertest');
const should = require('should');
const shouldHttp = require('should-http');
const request = supertest(config.url + ':' + config.port + '/v1');

const Log = require('../app/models/log');
const LogCtrl = require('../app/api/controllers/rest/log');

const mongoose = require('mongoose');
mongoose.connect(config.db);//FIX (deprecated)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Test the resource
describe('Log', function () {

    const uid = '123';
    const tid = "A";
    let eventQueue = [];

    it('should handle the addition of a log entry', function (done) {

        eventQueue.push({
            userId: uid,
            event: "EVENT",
            meta: {},
            date: new Date()
        });

        request
            .post('/users/' + uid + '/logs')
            .send({data: eventQueue})
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                } 
                res.should.have.property('error', false);
                done();
            });
        
    });
    
    it('should reject the addition of a non-sensible log entry', function (done) {

        eventQueue.pop(); //empty the queue again
        eventQueue.push("test");

        request
            .post('/users/' + uid + '/logs')
            .send({ data: eventQueue })
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('should reject the addition of a log entry if url user id and data user id do not match', function (done) {

        eventQueue.pop();
        eventQueue.push({
            userId: "100",
            event: 'e1',
            meta: {},
            date: new Date()
        });

        request
            .post('/users/' + uid + '/logs', LogCtrl.createLog) //uid is 1
            .send({ data: eventQueue })
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                done();
            });
    });
   
    it('should handle the addition of multiple log entries', function (done) {
        eventQueue = [];
        eventQueue.push({
            userId: uid,
            event: 'e1',
            meta: {},
            date: new Date()
        });
        eventQueue.push({
            userId: uid, 
            event: 'e2',
            meta: {},
            date: new Date()
        });
        eventQueue.push({
            userId: uid, 
            event: 'e3',
            meta: {},
            date: new Date()
        });

        request
            .post('/users/' + uid + '/logs', LogCtrl.createLog) //uid is 1
            .send({ data: eventQueue })
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                
                res.should.have.property('error', false);
                done();
            });
    });
    
});
