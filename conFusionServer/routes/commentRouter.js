const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Comments = require('../models/comments')

const commentRouter = express.Router()

commentRouter.use(bodyParser.json())

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.cors, (req, res, next) => {
    Comments.find(req.query).populate('author')
    .then((comments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.author = req.user._id;
        //req.body.dish = req.query;
        Comments.create(req.body, (err, comments) => {
            if (err) {
                // var err = new Error('Failed to add your favorite dish!');
                // err.status = 401;
                console.log(req.body);
                return next(err);
            } else {
                Comments.findById(comments._id).populate('author')
                .then(comment => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                })
            }
        });
    } else {
        err = new Error('Comment not fouond in the request body!');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /comments/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    Comments.remove({})
    .then(deleteRes => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(deleteRes);
    }, err => next(err))
    .catch(err => next(err));
});

commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId).populate('author')
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    }, err => next(err))
    .catch(err => next(err));
}).post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.end('POST operation is not supported on /comments/' + req.params.commentId);
}).put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null) {
            const currentUserId = req.user._id;
            const modifyUserId = comment.author;

            console.log('modifyUserId: ', modifyUserId);
            if (currentUserId.equals(modifyUserId)) {

                req.body.author = currentUserId;
                Comments.findByIdAndUpdate(req.params.commentId, {
                    $set: req.body
                }, { new: true })
                .then(comment => {
                    Comments.findById(comment._id).populate('author')
                    .then(comment => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(comment);
                    })
                }, err => next(err))
                .catch(err => next(err));
            } else {
                var err = new Error('Only user who created this comment can perform this operation!');
                err.status = 403;
                return next(err);
            }

        } else {
            error = new Error('Comment ' + req.params.commentId + 'is not found');
            error.status = 404;
            return next(error);
        }
    }, err => next(err))
    .catch(err => next(err));
}).delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then(comment => {
        if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
                error = new Error('Only user who created this comment can perform this operation!');
                error.status = 403;
                return next(error);
            }
            Comments.findByIdAndRemove(req.params.commentId)
            .then(deleteRes => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(deleteRes);
            }, err => next(err))
            .catch(err => next(err));
        } else {
            error = new Error('Comment ' + req.params.commentId + 'is not found');
            error.status = 404;
            return next(error);
        }
    }, err => next(err))
    .catch(err => next(err));
});

module.exports = commentRouter;
