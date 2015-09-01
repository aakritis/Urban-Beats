var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}

exports.do_work = function(req, res){
  res.render('signup.jade', { 
	  title: 'Urban Beats' 
  });
};

exports.do_register = function(req, res){
	console.log("in do_register");
	//console.log("values recieved + " + req.body.firname + " " + req.body.lasname + " " + req.body.fname + " " + req.body.pwd);
    //console.log("security questions + " + req.body.secques1 + " " + req.body.secans1);
    console.log("security questions + " + " Sec_Ques1: " + req.body.secques1 + " Sec_Ans1: " + req.body.secans1 + " Sec_Ques2: " + req.body.secques2 + " Sec_Ans2: " + req.body.secans2 + " Sec_Ques3: " + req.body.secques3 + " Sec_Ans3: " + req.body.secans3);
	query_db(req,res);
};

/*function initializeConnection(config) {
    function addDisconnectHandler(connection) {
        connection.on("error", function (error) {
            if (error instanceof Error) {
                if (error.code === "PROTOCOL_CONNECTION_LOST") {
                    console.error(error.stack);
                    console.log("Lost connection. Reconnecting...");

                    initializeConnection(connection.config);
                } else if (error.fatal) {
                    throw error;
                }
            }
        });
    }

    var connection = mysql.createConnection(config);

    // Add handlers.
    addDisconnectHandler(connection);

    connection.connect();
    return connection;
}*/

function query_db(req,res){
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
    connection.query("SELECT * FROM User WHERE user_id='" + req.body.fname + "'", function(err, rows, fields) {
			if(err){
				console.log("Error while selection into table +" + err);
			}
			else{
				if(rows.length == 0) {
					console.log("values Sent to DB + " + req.body.firname + " " + req.body.lasname + " " + req.body.fname + " " + req.body.pwd);
    			var values={first_name:req.body.firname, last_name:req.body.lasname, user_id:req.body.fname, password:req.body.pwd, review_count:0, member_since:"2015-04", Sec_Ques1:req.body.secques1, Sec_Ans1:req.body.secans1, Sec_Ques2:req.body.secques2, Sec_Ans2:req.body.secans2, Sec_Ques3:req.body.secques3, Sec_Ans3:req.body.secans3};
    			// inserting rows
    			connection.query('INSERT INTO User SET ?',values,function(in_err,in_rows,in_fields){
    				console.log("After Insert Query");
    				//connection.end(); // done with the connection
    				if ( in_err ){
							console.log("Error while inserting into table +" + in_err);
    				}
    				else{
							console.log("data successfully inserted into the database");
      				output_signup(res);
    				}
					}); // end connection.execute
				}
				else {
					// display error msg saying user exists
					console.log("User already exists");	
				}
			}
    });
		connection.release();
	}); // end sql.connect
}

function output_signup(res){
  res.render('signin.jade',
    { title: "Signin" }
  );
}
