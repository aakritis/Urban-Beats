var newSession = require('client-sessions');
var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}
var request = require("request");

exports.do_invalidate = function(req, response){
	var locks = req.body;
	console.log(locks);
	var arr = Object.keys(locks).map(function(key){
    return locks[key];
	});
  console.log(arr);   
  update_db(req, response, arr[0]);
};

function update_db(request,response,coupon_id) {
	var connection_pool = mysql.createPool(connection);
	connection_pool.getConnection(function(err, connection){
	//connection.connect (function(err, connection) {
		if(!err) {
			console.log("Connected DB");
			connection.query("Update User_Flyer set is_valid = 'no' where coupon_id ='" + coupon_id + "'", function(err, rows, fields) {
				//connection.end(); // connection close
				if (!err) {
					console.log("Update Successful");	
					//request("http://localhost:3000/invalidate");
					var flyer_id = request.newSession.flyerID;
					var coupon_details = [];
					var user_details = [];
					output_render (response,flyer_id,coupon_details,user_details);
				}
				else {
					var msg = "Error while authenticating users through query + " + err;
					console.log("Error while authenticating users through query + " + err);
										response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
				}
			});
		}
		else 
			console.log("Disconnected DB + " + err);
		connection.release();
	});
}

exports.do_work = function(request, res){
	if (Object.keys(request.query).length === 0) {
		var flyer_id = "";
		var coupon_details = [];
		var user_details = [];
		output_render (res,flyer_id,coupon_details,user_details);
	}
	else {
		var flyer_id = "";
		var coupon_details = [];
		var user_details = [];
		flyer_id = request.query.flyerid;
		request.newSession.flyerID = flyer_id;
		var connection_pool = mysql.createPool(connection);
		connection_pool.getConnection(function(err, connection){
		//connection.connect (function(err, connection) {
			if(!err) {
				console.log("Connected DB");
				connection.query("select coupon_id , CONCAT_WS(' ',first_name,last_name) as username from ( select coupon_id , user_id from User_Flyer where flyer_id = '" + flyer_id + "' and is_valid = 'yes')TempCoupon inner join User on TempCoupon.user_id = User.user_id;", function(err, rows, fields) {
					//connection.end(); // connection close
					if (!err) {
						//console.log("Results fetched + " + rows[0].first_name);
						if (rows.length > 0 ) {
							console.log("Coupons Authenticated");
							// do the required redirect - function call 
							// setting the value of user_id in the session
							for (var row in rows){
								coupon_details.push(String(rows[row].coupon_id));
								user_details.push(String(rows[row].username));
							}
							output_render (res,flyer_id,coupon_details,user_details);
						} 
						else {
							// display error msg for unauthenticated user
							console.log("No Coupons");
							// display error msg // UI change
							output_render (res,flyer_id,coupon_details,user_details);
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
};

function output_render(res,flyer_id,coupon_details,user_details){
		res.render('invalidatecoupon.jade', { variables: {
	  	title: 'Urban Beats', flyerid: flyer_id, arrcoupon: coupon_details, arruser: user_details }
  	});
}