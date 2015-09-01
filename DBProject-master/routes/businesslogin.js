var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}
var newSession = require('client-sessions');

/*
 * GET home page, which is specified in Jade.
 */

exports.do_work = function(req, res){
  res.render('businesslogin.jade', { 
	  title: 'Urban Beats' 
  });
};
exports.do_authenticate = function(request, response){
	console.log("do_authenticate data + " + request.body.fname);
	query_db(request,response,request.body.fname)
};

function query_db(request,response,business_id) {
	var connection_pool = mysql.createPool(connection);
	connection_pool.getConnection(function(err, connection){
	//connection.connect (function(err, connection) {
		if(!err) {
			console.log("Connected DB");
			connection.query("SELECT * FROM Business WHERE business_id='" + business_id + "'", function(err, rows, fields) {
				//connection.end(); // connection close
				if (!err) {
					console.log("Results fetched + " + rows[0].name);
					if (rows.length > 0 ) {
						console.log("Business Authenticated");
						// get categories for the given business_id 

						connection.query("select category_name from Categories C inner join Business_Categories BC on C.category_id = BC.category_id inner join Business B on BC.business_id = B.business_id where B.business_id='" + business_id + "'", function(err, in_rows, in_fields) {	
						//connection.end(); // connection close
							if (!err) {
								console.log("Results fetched + ");
								var array_categories = [];
								var count = 0;
								for (var row in in_rows){
									array_categories.push(String(in_rows[row].category_name));
									count++;
								}	

								console.log("Categories from joinned table + " + array_categories);
								
								// setting session variables for business 
								request.newSession.business_id = rows[0].business_id;
								request.newSession.business_name = rows[0].name;
								request.newSession.business_address = rows[0].full_address;
								request.newSession.business_city = rows[0].city;
								request.newSession.business_state = rows[0].state;
								request.newSession.business_stars = rows[0].stars;
								request.newSession.business_categories = rows[0].categories;
								request.newSession.business_image = rows[0].business_image;
								request.newSession.business_reviewcount = rows[0].review_count;
								request.newSession.business_email = rows[0].email;
								console.log("Session Values + " + request.newSession.business_name + "	" + request.newSession.business_address + "	" + request.newSession.business_city + "	" + request.newSession.business_state + "	" + request.newSession.business_stars + "	" + request.newSession.business_categories + "	" + request.newSession.business_reviewcount);
								// do the required redirect - function call
								output_businessview (response);
							}
							else {
								var msg = "Error while fetching category through query + " + err;
								console.log("Error while fetching category through query + " + err);
								response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
							}
						});
					} 
					else {
						// display error msg for unauthenticated user
						var msg = "Business Authentication Failed";
						console.log("Business Authentication Failed");
						// display error msg // UI change
						response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
					}
				}
				else {
					console.log("Error while authenticating users through query + " + err);
				}
			});
		}
		else {
			var msg = "Disconnected DB + " + err;
			console.log("Disconnected DB + " + err);
			response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
		}
		connection.release();
	});
}

function output_businessview(res){
	query_users(res);
};

function query_users(response) {
	var connection_pool = mysql.createPool(connection);
	connection_pool.getConnection(function(err, connection){
	//connection.connect (function(err, connection) {
		if(!err) {
			console.log("Connected DB");
			connection.query("SELECT first_name FROM User WHERE is_loggedIn = 1", function(err, rows, fields) {
				//connection.end(); // connection close
				if (!err) {
					console.log("Results fetched");
					if (rows.length > 0 ) {
						console.log("Logged in Users fetched");
						// do the required redirect - function call 
						var array_names = [];
						var count = 0;
						for (var row in rows){
							//console.log("Value + " + rows[row].first_name);
							array_names.push(String(rows[row].first_name));
							count++;
						}
						console.log("Users Pushed + " + array_names + "	" + count);
						output_render(response,count,array_names);
					} 
					else {
						// display error msg for unauthenticated user
						console.log("No Logged in Users");
						// display error msg // UI change
												var array_names = [];
						var count = 0;

						output_render(response,count,array_names);
					}
				}
				else {
					console.log("Error while authenticating users through query + " + err);
				}
			});
		}
		else {
			console.log("Disconnected DB + " + err);
		}
		connection.release();
	});
}

function output_render(res,count,names){
	console.log("data captured + " + count + "	" + names);
  res.render('businessview.jade', { variables:{
	  title: 'Urban Beats', arrnames:names, arrcount: count
	}
 });
};