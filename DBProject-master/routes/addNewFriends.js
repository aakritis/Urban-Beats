var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}
var nodemailer = require('nodemailer');

exports.do_work = function(req, res){
	var friends=[];
	if (Object.keys(req.query).length === 1) {
		var flyer_id = "";
		var coupon_details = [];
		var user_details = [];

		friend_id = req.query.friend;

		invite_db(req,res,friend_id);
		//res.redirect('/oldfliers');

	}
	else {
		var connection_pool = mysql.createPool(connection);
		connection_pool.getConnection(function(err, connection){
	 	  if ( err ){
	    		console.log("Error connecting to db + " + err);
	    }
	    console.log("Connected DB");
	    //select friend_id from Friends inner join User on User.user_id = Friends.friend_id where login_id = 'kaushik_surya333@yahoo.com' and is_loggedIn = 1
	    connection.query("select friend_id from Friends inner join User on User.user_id = Friends.friend_id where login_id ='" + req.newSession.user_id + "' and is_loggedIn = 1", function(err, rows, fields) {
				if(err){
					console.log("Error while selection into table +" + err);
				}
				else {
					// insert into array
					for (var row in rows){
							friends.push(String(rows[row].friend_id));
					}
					res.render('invitefriends.jade', { variables: {
						title: 'Urban Beats' , results:friends
	  			}
					});
				}
			});
			connection.release();
		}); // end sql.connect
	}
}


function invite_db(req,res,frnd){
	var connection_pool = mysql.createPool(connection);
	connection_pool.getConnection(function(err, connection){
	//connection.connect(function(err, connection){
		/*
  	var now = new Date();
    var jsonDate = now.toJSON();
    var member_since = new Date(jsonDate);
    */
    if ( err ){
    	console.log("Error connecting to db + " + err);
    }
    console.log("Connected DB");
    var transporter = nodemailer.createTransport();
		var to_val = frnd;
		// var to_val = 'chaitanya2537@gmail.com';
		var mailoptions = {
		  from: ' "Aakriti Singla" <aakritisingla4490@gmail.com>', // sender address
    	to: to_val, // list of receivers
    	subject: 'Invitation to try Urban Beats', // Subject line
    	text: 'Hi' + to_val + '	Please try this new app UrbanBeats http://localhost:3000/' // plaintext body
    	//html: '<b>http://localhost:3000/</b>' // html body
		};
		transporter.sendMail(mailoptions, function(error, info){
			if(error){
				console.log("Error while sending mail + " + error);
			}
			else{
				console.log("Successfully sent email");
			}
		});

    connection.query("SELECT * FROM Friends WHERE login_id='" + req.newSession.user_id + "' and friend_id='" + frnd + "'", function(err, rows, fields) {
			if(err){
				console.log("Error while selection into table +" + err);
			}
			else{
				if(rows.length == 0) {
    			var values={login_id:req.newSession.user_id,friend_id:frnd};
    			// inserting rows
    			connection.query('INSERT INTO Friends SET ?',values,function(in_err,in_rows,in_fields){
    				console.log("After Insert Query");
    				//connection.end(); // done with the connection
    				if ( in_err ){
							console.log("Error while inserting into table +" + in_err);
    				}
    				else{
							console.log("data successfully inserted into the database");
      				res.redirect('/invitefriends');
    				}
					}); // end connection.execute
				}
				else {
					// display error msg saying user exists
					res.redirect('/invitefriends');
				}
			}
    });
		connection.release();
	}); // end sql.connect
}