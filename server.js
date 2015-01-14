var restify     =   require('restify');
var mongojs     =   require('mongojs');
var morgan      =   require('morgan');

// Connection to DB: 1) Internal Mongo db, 2) External MongoLab db
// Connection to DB 1
//var db          =   mongojs('clinifApp', ['patient','clinifAppLists']);

// Connections to DB 2
// Previous that worked
//var db          =   mongojs('mongodb://admin:password@ds037990.mongolab.com:37990/clinification', ['appUsers','clinifAppLists']);

// Main database
var db          =   mongojs('mongodb://clinification:admin@ds039950.mongolab.com:39950/clinimongo', ['account','appointment']);

// Things to add eventually 'appointment','confirmation','doctor',

var server      =   restify.createServer();
 
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(morgan('dev')); // LOGGER
 
// CORS
server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
 
server.listen(process.env.PORT || 9804, function () {
    console.log("Server started @ ",process.env.PORT || 9804);
});

// Js files to db collections links
var managePatients = require('./auth/manageUser')(server, db);
//var managePatients = require('./auth/managePatient')(server, db);
var manageLists =   require('./clinifAppList/manageClinifAppList')(server, db);