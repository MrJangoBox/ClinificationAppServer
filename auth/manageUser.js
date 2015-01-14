var pwdMgr = require('./managePasswords');
 
module.exports = function (server, db) {
    
    var validateRequest = require("../auth/validateRequest");
    
    // unique index
    db.account.ensureIndex({
        username: 2
    }, {
        unique: true
    })
 
    server.post('/api/v1/clinifApp/auth/register', function (req, res, next) {
        var user = req.params;
        pwdMgr.cryptPassword(user.password, function (err, hash) {
            user.password = hash;
            console.log("n", hash);
            db.account.insert(user,
                function (err, dbUser) {
                    if (err) { // duplicate key error
                        if (err.code == 11000) /* http://www.mongodb.org/about/contributors/error-codes/*/ {
                            res.writeHead(400, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            res.end(JSON.stringify({
                                error: err,
                                message: "A user with this username already exists"
                            }));
                        }
                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        dbUser.password = "";
                        res.end(JSON.stringify(dbUser));
                    }
                });
        });
        return next();
    });
 
    server.post('/api/v1/clinifApp/auth/login', function (req, res, next) {
        var user = req.params;
        if (user.username.trim().length == 0 || user.password.trim().length == 0) {
            res.writeHead(403, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                error: "Invalid Credentials"
            }));
        }
        console.log("in");
        db.account.findOne({
            username: req.params.username
        }, function (err, dbUser) {
 
 
            pwdMgr.comparePassword(user.password, dbUser.password, function (err, isPasswordMatch) {
 
                if (isPasswordMatch) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    // remove password hash before sending to the client
                    dbUser.password = "";
                    res.end(JSON.stringify(dbUser));
                } else {
                    res.writeHead(403, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify({
                        error: "Invalid User"
                    }));
                }
 
            });
        });
        return next();
    });
    
    server.get('/api/v1/clinifApp/auth/profile', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            db.account.findOne({
                username: req.params.token
            }, function (err, profile) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(profile));
            });
        });
        return next();
    });
};