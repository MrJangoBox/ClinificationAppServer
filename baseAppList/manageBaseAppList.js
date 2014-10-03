module.exports = function (server, db) {
    var validateRequest = require("../auth/validateRequest");
 
    server.get("/api/v1/baseApp/data/list", function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            db.baseAppLists.find({
                user : req.params.token
            },function (err, list) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(list));
            });
        });
        return next();
    });
 
    server.get('/api/v1/baseApp/data/item/:id', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            db.baseAppLists.find({
                _id: db.ObjectId(req.params.id)
            }, function (err, data) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(data));
            });
        });
        return next();
    });
 
    server.post('/api/v1/baseApp/data/item', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            var item = req.params;
            db.baseAppLists.save(item,
                function (err, data) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify(data));
                });
        });
        return next();
    });
 
    server.put('/api/v1/baseApp/data/item/:id', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            db.baseAppLists.findOne({
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
                db.baseAppLists.update({
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
 
    server.del('/api/v1/baseApp/data/item/:id', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            db.baseAppLists.remove({
                _id: db.ObjectId(req.params.id)
            }, function (err, data) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(data));
            });
            return next();
        });
    });
 
}