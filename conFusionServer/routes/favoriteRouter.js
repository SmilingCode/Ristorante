const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Favorite = require('../models/favorite')

const favoriteRouter = express.Router()

favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.cors, (req, res, next) => {
    Favorite.find(req.query).populate('userId').populate('dishId')
    .then(favs => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favs);
    }, err => next(err))
    .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const currentUserId = req.user._id;
    Favorite.findOne({ userId: currentUserId })
    .then(fav => {
        console.log(fav)
        if (fav != null) {
            // user exist
            req.body.map((o, i) => {
                fav.dishId.push(o._id);
            });

            fav.save()
            .then(fav => {
                Favorite.findById(fav._id).populate('userId').populate('dishId')
                .then(fav => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                })
            }, err => next(err))
        } else {
            // new user
            Favorite.create({ userId: currentUserId }, function(err, favDish) {
                if (err) {
                    var err = new Error('Failed to add your favorite dish!');
                    err.status = 401;
                    return next(err);
                } else {
                    req.body.map((o, i) => {
                        favDish.dishId.push(o._id);
                    });

                    favDish.save()
                    .then(favDish => {
                        Favorite.findById(favDish._id).populate('userId').populate('dishId')
                        .then(favDish => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favDish);
                        })
                    }, err => next(err))
                }
            })
        }
    })
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorite');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.remove({})
    .then(deleteRes => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(deleteRes);
    }, err => next(err))
    .catch(err => next(err));
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.cors, (req, res, next) => {
    Favorite.findOne({ userId: req.user._id })
    .then(fav => {
        // user not exist
        if (!fav) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ "exists": false, "favorite": fav});
        } else {
            // user exist
            if (fav.dishId.indexOf(req.params.dishId) < 0) {
                // dishId is not in the favorite list
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({ "exists": false, "favorite": fav});
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({ "exists": true, "favorite": fav});
            }
        }
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const currentUserId = req.user._id;
    Favorite.findOne({ userId: currentUserId })
    .then(favUser => {
        if (favUser != null) {
            // user already exist
            favUser.dishId.push(req.params.dishId);
            favUser.save()
            .then(fav => {
                Favorite.findById(fav._id).populate('userId').populate('dishId')
                .then(favDish => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favDish);
                }, err => next(err))
                .catch(err => next(err));
            })
        } else {
            // new user
            Favorite.create({ userId: currentUserId}, function(err, fav) {
                if (err) {
                    var err = new Error('Failed to create a new user to favorite collection!');
                    err.status = 401;
                    return next(err);
                } else {
                    fav.dishId.push(req.params.dishId);
                    fav.save()
                    .then(fav => {
                        Favorite.findById(fav._id).populate('userId').populate('dishId')
                        .then(favDish => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favDish);
                        })
                    })
                }
            })
        }
    })
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorite' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ userId: req.user._id })
    .then(fav => {
        if (fav != null) {
            // exist user
            const dishNum = fav.dishId.indexOf(req.params.dishId);
            if (dishNum !== -1) {
                //fav.dishId.id(dishNum).remove();
                fav.dishId.pull({ _id: req.params.dishId })
                fav.save()
                .then(fav => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                }, err => next(err));
            } else {
                res.statusCode = 401;
                res.send('dishId: ' + req.params.dishId + 'is not in your favorite list!');
            }

        } else {
            res.statusCode = 401;
            res.end('dishId: ' + req.params.dishId + 'is not in your favorite list!');
        }
    })
})

module.exports = favoriteRouter
