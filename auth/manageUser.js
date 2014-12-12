var pwdMgr = require('./managePasswords');
 
module.exports = function (server, db) {
    // unique index
    db.patient.ensureIndex({
        cellphone: 2
    }, {
        unique: true
    })
 
    server.post('/api/v1/baseApp/auth/register', function (req, res, next) {
        var user = req.params;
        pwdMgr.cryptPassword(user.password, function (err, hash) {
            user.password = hash;
            console.log("n", hash);
            db.patient.insert(user,
                function (err, dbUser) {
                    if (err) { // duplicate key error
                        if (err.code == 11000) /* http://www.mongodb.org/about/contributors/error-codes/*/ {
                            res.writeHead(400, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            res.end(JSON.stringify({
                                error: err,
                                message: "A user with this cellphone already exists"
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
 
    server.post('/api/v1/baseApp/auth/login', function (req, res, next) {
        var user = req.params;
        if (user.cellphone.trim().length == 0 || user.password.trim().length == 0) {
            res.writeHead(403, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                error: "Invalid Credentials"
            }));
        }
        console.log("in");
        db.patient.findOne({
            cellphone: req.params.cellphone
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
};