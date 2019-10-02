const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json())

leaderRouter.route('/')
.get(cors.cors, (req, res, next) => {
    Leaders.find(req.query)
    .then(leaders => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }, err => next(err))
    .catch(err => next(err));
}).post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.create(req.body)
    .then(leader => {
        console.log('Leader is created ', leader);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, err => next(err))
    .catch(err => next(err));
}).put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.send('Update is not supported on /leaders');
}).delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.remove({})
    .then(deleteRes => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(deleteRes);
    }, err => next(err))
    .catch(err => next(err));
});

leaderRouter.route('/:leaderId')
.get(cors.cors, (req, res, next) => {
    Leaders.findById(req.params.leaderId)
    .then(leader => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, err => next(err))
    .catch(err => next(err));
}).post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.send('POST is not supported on /leaders/' + req.params.leaderId);
}).put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId, { $set: req.body }, { new: true })
    .then(leader => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, err => next(err))
    .catch(err => next(err));
}).delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then(leader => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, err => next(err))
    .catch(err => next(err));
})

module.exports = leaderRouter;
