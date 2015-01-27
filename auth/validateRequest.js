var isUserNameValid = function (db, username, callback) {
    db.account.findOne({
        username: username
    }, function (err, user) {
        callback(user);
    });
};
 
module.exports.validate = function (req, res, db, callback) {
    // if the request dosen't have a header with username, reject the request
    if (!req.params.token) {
        res.writeHead(403, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({
            error: "You are not authorized to access this application",
            message: "A username is required as part of the header"
        }));
    };
 
 
    isUserNameValid(db, req.params.token, function (user) {
        if (!user) {
            res.writeHead(403, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                error: "You are not authorized to access this application",
                message: "Invalid Username"
            }));
        } else {
            callback();
        }
    });
};