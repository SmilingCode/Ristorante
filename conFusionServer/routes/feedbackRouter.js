const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Feedbacks = require('../models/feedbacks')

const feedbackRouter = express.Router()

feedbackRouter.use(bodyParser.json())

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.cors, (req, res, next) => {
    Feedbacks.find({}).populate('user')
    .then(feedbacks => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, err => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, (req, res, next) => {

    Feedbacks.create(req.body)
    .then(feedback => {
        console.log('feedback is created ', feedback);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, err => next(err))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /feebacks');
})
.delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation is not supported on /feedbacks currently');
})

module.exports = feedbackRouter;
