var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

router.use(bodyParser.json())

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

/* GET users listing. */
router.get('/', cors.cors, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, function(req, res, next) {

    User.find({})
    .then(users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send(users);
    });
});

router.post('/signup', cors.corsWithOptions, function(req, res, next) {
/*
    // username does not exist in db
    User.findOne({username: req.body.username})
    .then(user => {
        if (user != null) {
            var err = new Error('User ' + req.body.username + ' already exist');
            err.status = 403;
            next(err);
        } else {
            return User.create({
                username: req.body.username,
                password: req.body.password
            })
        }
    })
    .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ status: 'Rego Successful!', user: user });
    }, err => next(err))
    .catch(err => next(err));
*/
    // signup with passport
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
        } else {
            if (req.body.firstname) {
                user.firstname = req.body.firstname;
            }
            if (req.body.lastname) {
                user.lastname = req.body.lastname;
            }
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err: err });
                    return ;
                }

                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Rego Successful!' });
                });
            });
        }
    });
});

router.post('/login', cors.corsWithOptions, function(req, res) {
/*
    // not has session with name user
    if (!req.session.user) {
    //if (!req.signedCookies.user) {
        var authHeader = req.headers.authorization;
        // auth header not exist
        if (!authHeader) {
            var err = new Error('You are not authenticated!');

            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
        // get username and password from auth header
        var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

        var username = auth[0];
        var password = auth[1];
        // find username in db
        User.findOne({ username: username })
        .then(user => {
            // username does not exist
            if (user === null) {
                var err = new Error('User ' + username + ' does not exist');

                res.setHeader('WWW-Authenticate', 'Basic');
                err.status = 403;
                return next(err);
            // username exist, but password is not correct
            } else if (user.password !== password) {
                var err = new Error('You password is incorrect!');

                res.setHeader('WWW-Authenticate', 'Basic');
                err.status = 401;
                return next(err);
            // username and password both match db
            } else if (user.username === username && user.password === password) {
                //res.cookie('user', 'admin', { signed: true })
                req.session.user = 'authenticated';
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/plain');
                res.send('You are authenticated!');
            }
        })
        .catch(err => next(err));

    } else {
    // has session with name user
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/plain');
        res.send('You are already authenticated!')
    }
 */
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, status: 'Login Unsuccessful!', err: info });
        }

        req.logIn(user, (err) => {
            if (err) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: false, status: 'Login Unsuccessful!', err: 'Cound not login!' });
            }

            // create token
            var token = authenticate.getToken({ _id: req.user._id, admin: req.user.admin});

            // return login Successful
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, token: token, status: 'Login Successful!' });
        });

    }) (req, res);

});

router.get('/logout', cors.cors, (req, res, next) => {
    // session exist
    if (req.session) {
        // delete session
        req.session.destroy();
        // delete cookie
        res.clearCookie('session-id');
        res.redirect('/');
    // no any session
    } else {
        var err = new Error('You are not login yet!');
        err.status = 403;
        next(err);
    }
});

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ status: 'JWT invalid!', success: false, err: info});
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ status: 'JWT valid!', success: true, user: info});
        }
    }) (req, res, next);
})

module.exports = router;
