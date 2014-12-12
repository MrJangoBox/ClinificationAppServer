var isCellPhoneValid = function (db, cellphone, callback) {
    db.patient.findOne({
        cellphone: cellphone
    }, function (err, user) {
        callback(user);
    });
};
 
module.exports.validate = function (req, res, db, callback) {
    // if the request dosen't have a header with cellphone, reject the request
    if (!req.params.token) {
        res.writeHead(403, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({
            error: "You are not authorized to access this application",
            message: "A cellphone is required as part of the header"
        }));
    };
 
 
    isCellPhoneValid(db, req.params.token, function (user) {
        if (!user) {
            res.writeHead(403, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                error: "You are not authorized to access this application",
                message: "Invalid User Cellphone"
            }));
        } else {
            callback();
        }
    });
};