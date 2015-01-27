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
    
    
    server.put('/api/v1/clinifApp/auth/updateProfile', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            db.account.findOne({
                username: req.params.token
            }, function (err, data) {
                pwdMgr.comparePassword(req.params.password, data.password, function (err, isPasswordMatch) {
 
                    if (isPasswordMatch) {
                        // merge req.params/product with the server/product
 
                        var updProd = {}; // updated products 
                        // logic similar to jQuery.extend(); to merge 2 objects.
                        for (var n in data) {
                            updProd[n] = data[n];
                        }
                        for (var n in req.params) {
                            if (n != "password" && n != "token")
                                updProd[n] = req.params[n];
                        }
                        db.account.update({
        //                    _id: db.ObjectId(req.params.id)
                            username: req.params.token
                        }, updProd, {
                            multi: false
                        }, function (err, data) {
                            res.writeHead(200, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            res.end(JSON.stringify(data));
                        });
                        // remove password hash before sending to the client
                        data.password = "";
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
        });
        return next();
    });
    
    server.post('/api/v1/clinifApp/data/item', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            var item = req.params;
            db.appointment.save(item,
                function (err, data) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify(data));
                });
        });
        return next();
    });
 
    server.put('/api/v1/clinifApp/data/item/:id', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            db.appointment.findOne({
                _id: db.ObjectId(req.params.id)
            }, function (err, data) {
                // merge req.params/product with the server/product
 
                var updProd = {}; // updated products 
                // logic similar to jQuery.extend(); to merge 2 objects.
                for (var n in data) {
                    updProd[n] = data[n];
                }
                for (var n in req.params) {
                    if (n != "id")
                        updProd[n] = req.params[n];
                }
                db.appointment.update({
                    _id: db.ObjectId(req.params.id)
                }, updProd, {
                    multi: false
                }, function (err, data) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify(data));
                });
            });
        });
        return next();
    });
    
};