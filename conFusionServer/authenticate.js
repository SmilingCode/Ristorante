const passport = require('passport');
// Local Strategy
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

// Jwt Strategy
var JwtStrategy = require('passport-jwt').Strategy;
// for later setting: extract token from where
var ExtractJwt = require('passport-jwt').ExtractJwt;
// jwt.sign: for later creating token
var jwt = require('jsonwebtoken');

var config = require('./config');

// set Local Strategy
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create token
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    })
}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
// set Jwt Strategy
exports.jwtPassport = passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log('jwt_payload: ', jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
            return done(err, false);
        } else if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));
// authenticate with jwt rule
exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyOrdinaryUser = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];

        if (token) {
            jwt.verify(token, config.secretKey, function(err, result) {
                if (err) {
                    var err = new Error('You are not authenticated!');
                    err.status = 401;
                    return next(err);
                } else {
                    //console.log(result);
                    req.user = result;
                    next();
                }
            })
        }
    }
}

exports.verifyAdmin = (req, res, next) => {
    const isAdmin = req.user.admin;
    if (isAdmin) {
        return next();
    } else {
        var err = new Error('You are not autorized, only administrator can perform this operation!');
        err.status = 403;
        return next(err);
    }
}
