/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var pg = require("pg")
var express = require('express');
var bodyParser = require("body-parser");
var psql;

//var hogan = require('hogan-express');
//var path = require('path');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

var port = (process.env.VCAP_APP_PORT || 'test-port');
var host = (process.env.VCAP_APP_HOST || 'test-host');

app.set('port', port);

//app.use(express.logEUR());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


if (process.env.VCAP_SERVICES) {
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var credentials = env['user-provided'][0]['credentials'];
	var postgre_public_hostname = credentials['public_hostname'];
	var postgre_username = credentials['username'];
	var postgre_password = credentials['password']; 
	var postgre_conn_string = 'postgres://'+postgre_username+':'+postgre_password+'@'+postgre_public_hostname+'/compose';
};



app.post('/ask', function (req, res){
//	calculate cost
	switch (req.body.country){
	case "UK" :  tabName = "SaaS_UK_Pricing";
			break;
	case "EUR" : tabName = "SaaS_EUR_Pricing";
			break;
	case "US" :	tabName = "SaaS_US_Pricing";
			break;
	case "AUS" :	tabName = "SaaS_AUS_Pricing";
			break;
	};
	
	var qString2 = "SELECT quantity_tier,  srp_ref \n" +
    "FROM public." + tabName + " \n" +
    "WHERE (part_number = 'D1IKXLL')";
	console.log("query2: " + qString2);
	
	var q = "SELECT part_number,  srp_ref \n " +
	"FROM public." + tabName +  "\n " +
			"WHERE part_number = 'D1ILBLL' \n " +
			"OR part_number = 'D1ILILL' \n " +
			"OR part_number = 'D1ILKLL' \n " +
			"OR part_number = 'D1ILNLL'";

console.log("query: " + q);
	
	var client = new pg.Client(postgre_conn_string);
	
	client.connect(function(err) {
	    if (err) {
	      res.end("Could not connect to postgre: " + err);
	    }
	    console.log("connection opened");
	    client.query(qString2, function(err, result) {
	      if (err) {
	        res.end("Error running query: " + err);
	      }
	      console.log("Output: " + result.rows[0].quantity_tier);
	      client.query(q, function(err, result) {
		      if (err) {
		        res.end("Error running query: " + err);
		      }
		      
		      res.end("ending");
		      console.log("srp_ref: " + result.rows[0].srp_ref);
		      client.end();
		    });
	      
	      client.end();
	    });
	  });
	});

function cummulativeTierCalc(rows, num){
	var cost = 0;
	var lowerTier = 0;
for (i = 0; i<rows.length; i++){
	var tierLimit = rows[i].quantity_tier;
	var chunkPrice = rows[i].srp_ref;
	if ((num <= tierLimit && num > lowerTier)){
		console.log("last tier: " + rows[i].quantity_tier + " " + rows[i].srp_ref);
// this is the last tier
		cost += (num - lowerTier)*chunkPrice;
		console.log("Cummulative cost: " + cost);
		return cost;
		
	};
	if (num == 0){
		return 0;
	};

	// otherwise, just add the full chunk to the price
	// and move on
	cost += (tierLimit - lowerTier)*chunkPrice;
	lowerTier = tierLimit;
};
};




// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});