var newSession = require('client-sessions');
var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}
var nodemailer = require('nodemailer');

exports.do_work = function(req, res){
	query_db(req,res);
};

exports.do_updateflier = function(req, res){
	var locks = req.body;
	console.log(locks);
	var arr = Object.keys(locks).map(function(key){
    return locks[key];
});
  console.log(arr);   
  update_db(req, res, arr[0]);
};

function update_db(req,response, flyer) {
	var connection_pool = mysql.createPool(connection);
	connection_pool.getConnection(function(err, connection){
	//connection.connect (function(err, connection) {
		if(!err) {
			console.log("Connected DB");
			var business_id = req.newSession.business_id;
			connection.query("Update Flyer set is_accepted = 'no' WHERE business_id='" + business_id + "'", function(err, rows, fields) {
				//connection.end(); // connection close
				if (!err) {
					console.log("Updated value for flyer");
					connection.query("Update Flyer set is_accepted = 'yes' WHERE business_id='" + business_id + "' and flyer_coupon='" + flyer + "'", function(err, in_rows, in_fields) {
						//connection.end(); // connection close
						if (!err) {
							console.log("Updated value for flyer");
							/*var transporter = nodemailer.createTransport("SMTP",{
    						service: 'gmail',
    						auth: {
        					user: 'aakritisingla4490@gmail.com',
        					pass: 'dushangarg4490'
        				}
							});*/
							var transporter = nodemailer.createTransport();
							// var to_val = req.newSession.business_email;
							var to_val = 'chaitanya2537@gmail.com';
							var mailoptions = {
						    from: ' "Aakriti Singla" <aakritisingla4490@gmail.com>', // sender address
    						to: to_val, // list of receivers
    						subject: 'Current Active Flyer for + ' + req.newSession.business_id, // Subject line
    						text: 'Active Flyer : Deal -	' + flyer + '	FlyerID -	' // plaintext body
    						//html: '<b>Hello world ✔</b>' // html body
							};

							transporter.sendMail(mailoptions, function(error, info){
								if(error){
									console.log("Error while sending mail + " + error);
								}
								else{
									console.log("Successfully sent email");
								}
							});

						}
						else {
							var msg = "Error while updating 1 in flyer + " + err;
							console.log("Error while updating 1 in flyer + " + err);
							response.render('errordisplay.jade', { variables:{
          title: 'Urban Beats', error: msg
		                                }
                            });

						}
					});
				}
				else {
					var msg = "Error while updating 0 in flyer + " + err;
					console.log("Error while updating 0 in flyer + " + err);
					console.log("Error while updating 1 in flyer + " + err);
							response.render('errordisplay.jade', { variables:{
          title: 'Urban Beats', error: msg
		                                }
                            });
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

function query_db(req,response) {
	var connection_pool = mysql.createPool(connection);
	connection_pool.getConnection(function(err, connection){
	//connection.connect (function(err, connection) {
		if(!err) {
			console.log("Connected DB");
			var business_id = req.newSession.business_id;
			//connection.query("SELECT flyer_coupon FROM Flyer WHERE business_id='" + business_id + "'", function(err, rows, fields) {
				connection.query("select flyer_id, flyer_coupon, (selects/views * 100) as success_rate from (select flyer_id,flyer_coupon,No_of_selects as selects,Case when No_of_views = 0 then 1 else No_of_views end as views from Flyer where business_id='" + business_id + "') temp", function(err, rows, fields) {
				//connection.end(); // connection close
				if (!err) {
					console.log("Results fetched");
					console.log("Flyers fetched");
					// do the required redirect - function call 
					var array_names = [];
					var array_success = [];
					var array_id = [];
					var count = 0;
					for (var row in rows){
						array_id.push(String(rows[row].flyer_id));
						array_names.push(String(rows[row].flyer_coupon));
						array_success.push(String(rows[row].success_rate));
						count++;
					}
					console.log("data pushed + " + count + "	" + array_names + "	" + array_success + "	" + array_id);					 
					output_render(response,count,array_names,array_id,array_success);
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

function output_render(res,count,names,id,success){
	console.log("data captured + " + count + "	" + names);
  res.render('oldfliers.jade', { variables:{
	  title: 'Urban Beats', arrnames:names, arrcount:count, arrid:id, arrsuccess:success
	}
 });
};