/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var pg = require("pg");
var express = require('express');
var bodyParser = require("body-parser");
var psql;

var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;

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

// more Single Sing on stuff
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var ssoConfig = services.SingleSignOn[0];
var client_id = ssoConfig.credentials.clientId;
var client_secret = ssoConfig.credentials.secret;
var authorization_url = ssoConfig.credentials.authorizationEndpointUrl;
var token_url = ssoConfig.credentials.tokenEndpointUrl;
var issuer_id = ssoConfig.credentials.issuerIdentifier;
var callback_url = 'https://ssp-pricing-beta.mybluemix.net/auth/sso/callback';

var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
var Strategy = new OpenIDConnectStrategy({
    authorizationURL : authorization_url,
    tokenURL : token_url,
    clientID : client_id,
    scope: 'openid',
    response_type: 'code',
    clientSecret : client_secret,
    callbackURL : callback_url,
    skipUserProfile: true,
    issuer: issuer_id
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        done(null, profile);
    });
});

passport.use(Strategy);
app.get('/login', passport.authenticate('openidconnect', {}));

function ensureAuthenticated(req, res, next) {
    if(!req.isAuthenticated()) {
        req.session.originalUrl = req.originalUrl;
        res.redirect('/login');
    } else {
        console.log("returning next")
        return next();
    }
}

app.get('/auth/sso/callback',function(req,res,next) {
    var redirect_url = req.session.originalUrl;
    console.log("authenticating");
    passport.authenticate('openidconnect', {
        successRedirect: '/index.html',
        failureRedirect: '/failure',
    })(req,res,next);
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/failure', function(req, res) {
    res.send('Login failed');
});

app.get('*', ensureAuthenticated);

// End of Single Sign on Stuff

// Set up DB Connections


if (process.env.VCAP_SERVICES) {
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var credentials = env['user-provided'][0]['credentials'];
	var postgre_public_hostname = credentials['public_hostname'];
	var postgre_username = credentials['username'];
	var postgre_password = credentials['password']; 
	var postgre_conn_string = 'postgres://'+postgre_username+':'+postgre_password+'@'+postgre_public_hostname+'/compose';
}

var countryLinks = 
	[
	{name : "UK",
	 table : "saas_uk_pricing"},
	{name : "EUR",
	  table : "saas_uk_pricing"},
	{name : "AUS",
	 table : "saas_aus_pricing"},
	{name : "US",
	 table : "saas_us_pricing"}
	];

app.post('/ask', function (req, res){
//	calculate cost
	
	tabName = writeTabnameCountries(req.body.country, countryLinks);
	
//	branch for products
	
	if (req.body.product == "B2C"){
//		B2C button was pressed
		var events = req.body.interactions/1000;
	
		var q1 = "SELECT quantity_tier,  srp_ref \n" +
		"FROM public." + tabName + " \n" +
		"WHERE (part_number = 'D1IKXLL')";
		console.log("MCB2C query1: " + q1);

		var q2 = "SELECT part_number,  srp_ref \n " +
		"FROM public." + tabName +  "\n " +
			"WHERE part_number = 'D1IKBLL' \n " +
			"OR part_number = 'D1ILILL' \n " +
			"OR part_number = 'D1ILKLL' \n " +
			"OR part_number = 'D1ILMLL'";

		console.log("MCB2C query2: " + q2);
		var client = new pg.Client(postgre_conn_string);
		client.connect(function(err) {
			if (err) {
				res.end("Could not connect to postgre: " + err);
// 		    	make all references to res return error
			}
			console.log("connection opened");
			client.query(q1, function(err, result) {
				if (err) {
					res.end("Error running query: " + err);
				}
				console.log("Output: " + result.rows[0].quantity_tier);
				var cost = cummulativeTierCalc(result.rows, events);
				
			client.query(q2, function(err, result) {
					if (err) {
						res.end("Error running query: " + err);
					}	
					console.log("returnedValue: " + result);
					var B2CSetup = Number(result.rows[3]['srp_ref']);
					var StandardAccess = result.rows[0]['srp_ref'];
					var mcinsightsP = result.rows[2]['srp_ref'];
					var mcusersP = result.rows[1]['srp_ref'];
					
//					calculates price from returned value
					var priceEstimateM = (cost +
							Number(StandardAccess) + 
							Number(req.body.mcusers)*Number(mcusersP) + 
							Number(req.body.mcinsights)*Number(mcinsightsP)/100000);
					var priceEstimateY = priceEstimateM*12;
							
					res.send({pricem : priceEstimateM, 	pricey : priceEstimateY, b2csetup : B2CSetup});
					res.end();
					client.end();
				});
				client.end();
			});
		});

	} else if (req.body.product == "B2B"){

		//		B2B button was pressed

		var dbRecords = req.body.dbrec/10000;

		var q1 = "SELECT quantity_tier,  srp_ref \n" +
				"FROM public." + tabName + " \n" +
				"WHERE (part_number = 'D1ILFLL')";
		console.log("MCB2B query1: " + q1);
		
//		parts for IBM marketing Cloud:
//		IBM Marketing Cloud B2B Standard Access per Month
//		IBM Marketing Cloud Additional User Authorized User per Month
//		IBM Marketing Cloud Additional Email Insights Opens Hundred Thousand Events per Month
//		IBM Marketing Cloud B2B Standard Onboarding Services Engagement One-Time Set Up
//		Standard access and Onboarding Services Engagement differ depending on enterprise or standard
		


		if (req.enterprise == false){
//			B2B standard
			var q2 = "SELECT part_number,  srp_ref \n " +
				"FROM public." + tabName +  "\n " +
				"WHERE part_number = 'D1ILBLL' \n " +
				"OR part_number = 'D1ILILL' \n " +
				"OR part_number = 'D1ILKLL' \n " +
				"OR part_number = 'D1ILNLL'";
			
			
			
			
		}else{
//			B2B enterprise
			var q2 = "SELECT part_number,  srp_ref \n " +
			"FROM public." + tabName +  "\n " +
			"WHERE part_number = 'D1K5VLL' \n " +
			"OR part_number = 'D1ILILL' \n " +
			"OR part_number = 'D1ILKLL' \n " +
			"OR part_number = 'D1K62LL'";
			
		}
		

		console.log("MCB2B query2: " + q2);
		var client = new pg.Client(postgre_conn_string);
		client.connect(function(err) {
			if (err) {
				res.end("Could not connect to postgre: " + err);
// 		    	make all references to res return error
			}
			console.log("connection opened");
			client.query(q1, function(err, result) {
				if (err) {
					res.end("Error running query: " + err);
				}
				console.log("Output: " + result.rows[0].quantity_tier);
				var cost = cummulativeTierCalc(result.rows, dbRecords);

				client.query(q2, function(err, result) {
					if (err) {
						res.end("Error running query: " + err);
					}
					console.log("returnedValue: " + result);
					var B2BSetup = Number(result.rows[3]['srp_ref']);
					var StandardAccess = result.rows[0]['srp_ref'];
					var mcinsightsP = result.rows[2]['srp_ref'];
					var mcusersP = result.rows[1]['srp_ref'];

                    console.log("B2B setup: " + B2BSetup);
                    console.log("StandardAccess: " + StandardAccess);
                    console.log("mcinsightsP: " + mcinsightsP);
                    console.log("mcusersP: " + mcusersP);

//					calculates price from returned value
					var priceEstimateM = (cost +
					Number(StandardAccess) +
					Number(req.body.mcusers)*Number(mcusersP) +
					Number(req.body.mcinsights)*Number(mcinsightsP)/100000);
					var priceEstimateY = priceEstimateM*12;
                    console.log("Cost: " + cost);
                    console.log("PriceM: " + priceEstimateM);
                    console.log("PriceY: " + priceEstimateY);
                    console.log("b2bsetup: " + B2BSetup);

                    res.send({pricem : priceEstimateM, 	pricey : priceEstimateY, b2bsetup : B2BSetup});
                    res.end();
					client.end();
				});
				client.end();
			});
		});
		
	}
    else if (req.body.product == "spopB2c") {

        //		Silverpop B2C button was pressed

		var plan = "";

		switch (req.body.spopinsights){
			case "platinum" :  plan = "OR \"part_number\" = 'D1AVWLL'";
				break;
			case "bronze" : plan = "OR \"part_number\" = 'D1AVNLL'";
				break;
			case "silver" :	plan = "OR \"part_number\" = 'D1AVSLL'";
				break;
			case "gold" :	plan = "OR \"part_number\" = 'D1AVULL'";
				break;
		}
		
		

        var SpopMsg = req.body.spopmsg/1000;


        var q1 = "SELECT quantity_tier,  srp_ref \n" +
            "FROM public." + tabName + " \n" +
            "WHERE (part_number = 'D1AVQLL')";
        console.log("SPOPB2C query1: " + q1);

        var q2 = "SELECT part_number,  srp_ref \n " +
            "FROM public." + tabName +  "\n " +
            "WHERE part_number = 'D1AW9LL' \n " +
            plan;

        console.log("SPOPB2C query2: " + q2);
        var client = new pg.Client(postgre_conn_string);
        client.connect(function(err) {
            if (err) {
                res.end("Could not connect to postgre: " + err);
// 		    	make all references to res return error
            }
            console.log("connection opened");
            client.query(q1, function(err, result) {
                if (err) {
                    res.end("Error running query: " + err);
                }
                console.log("Output: " + result.rows[0]['quantity_tier']);
                var cost = cummulativeTierCalc(result.rows, SpopMsg);

                client.query(q2, function(err, result) {
                    if (err) {
                        res.end("Error running query: " + err);
                    }
                    console.log("returnedValue: " + result);
					var priceEstimateM = 0;
					if(plan == ""){
						var setup = Number(result.rows[0]['srp_ref']);
						priceEstimateM = (Number(cost));
					}else{
						var planCost = result.rows[0]['srp_ref'];
						var setup = Number(result.rows[1]['srp_ref']);
						priceEstimateM = (Number(cost)) + Number(planCost);
					}

                    console.log("SPOPB2C setup: " + setup);
                    console.log("planCost: " + planCost);
					console.log("cost :" + cost);

//					calculates price from returned value
					var priceEstimateY = priceEstimateM*12;

					res.send({pricem : priceEstimateM, 	pricey : priceEstimateY, spopsetup : setup});
					res.end();
                    client.end();
                });
                client.end();
            });
        });
    }
	else if (req.body.product == "spopB2b") {

		//		Silverpop B2B button was pressed

		var plan = "";

		switch (req.body.spopinsights){
			case "platinum" :  plan = "OR \"part_number\" = 'D1AVWLL'";
				break;
			case "bronze" : plan = "OR \"part_number\" = 'D1AVNLL'";
				break;
			case "silver" :	plan = "OR \"part_number\" = 'D1AVSLL'";
				break;
			case "gold" :	plan = "OR \"part_number\" = 'D1AVULL'";
				break;
		}

		var SpopDB = req.body.spopdb/10000;


		var q1 = "SELECT quantity_tier,  srp_ref \n" +
				"FROM public." + tabName + " \n" +
				"WHERE (part_number = 'D1AWHLL')";
		console.log("SPOPB2B query1: " + q1);

		var q2 = "SELECT part_number,  srp_ref \n " +
				"FROM public." + tabName +  "\n " +
				"WHERE part_number = 'D1AW9LL' \n " +
				plan;

		console.log("SPOPB2C query2: " + q2);
		var client = new pg.Client(postgre_conn_string);
		client.connect(function(err) {
			if (err) {
				res.end("Could not connect to postgre: " + err);
// 		    	make all references to res return error
			}
			console.log("connection opened");
			client.query(q1, function(err, result) {
				if (err) {
					res.end("Error running query: " + err);
				}
				console.log("Output: " + result.rows[0]['quantity_tier']);
				var cost = cummulativeTierCalc(result.rows, SpopDB);

				client.query(q2, function(err, result) {
					if (err) {
						res.end("Error running query: " + err);
					}
					console.log("returnedValue: " + result);
					var priceEstimateM = 0;
					if(plan == ""){
						var setup = Number(result.rows[0]['srp_ref']);
						priceEstimateM = (Number(cost));
					}else{
						var planCost = result.rows[0]['srp_ref'];
						var setup = Number(result.rows[1]['srp_ref']);
						priceEstimateM = (Number(cost)) + Number(planCost);
					}

					console.log("SPOPB2B setup: " + setup);
					console.log("planCost: " + planCost);
					console.log("cost :" + cost);

//					calculates price from returned value
					var priceEstimateY = priceEstimateM*12;

					res.send({pricem : priceEstimateM, 	pricey : priceEstimateY, spopsetupb2b : setup});
					res.end();
					client.end();
				});
				client.end();
			});
		});
	}



});

function doQueries(q1, q2, quantity){

};


function writeTabnameCountries(input, countries){
//	cycle through list and compare against 
	for (i = 0; i<countries.length; i++){
		if (countries[i].name == input){
			return countries[i].table;
		};
	};
	return countries[0].table;
};

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