var newSession = require('client-sessions');
var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}

exports.do_work = function(req, res){
	query_db(req,res);
};

function query_db(req,response) {
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
							array_names.push(String(rows[row].first_name));
							count++;
						}
						console.log("data pushed + " + count + "	" + array_names);					
						output_render(response,count,array_names);
					} 
					else {
						// display error msg for unauthenticated user
						console.log("No Logged in Users");
						                response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: "No Logged in Users"
                                }
                            });

						// display error msg // UI change
					}
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

function output_render(res,count,names){
	console.log("data captured + " + count + "	" + names);
  res.render('businessview.jade', { variables:{
	  title: 'Urban Beats', arrnames:names, arrcount: count
	}
 });
};