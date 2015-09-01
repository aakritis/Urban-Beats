var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}
var newSession = require('client-sessions');

exports.do_work = function(req, res){
    var connection_pool = mysql.createPool(connection);
    connection_pool.getConnection(function(err, connection){
    //connection.connect (function(err, connection) {
        if(!err) {
            console.log("Connected DB");
            connection.query("SELECT * FROM Flyer WHERE is_accepted = 'yes' and business_id='" + req.newSession.business_id + "' limit 1", function(err, rows, fields) {
                //connection.end(); // connection close
                if (!err) {
                    //console.log("Results fetched + " + rows[0].name);
                    if (rows.length > 0 ) {
                        console.log("Flyer Authenticated");
                        // setting session variables for business 
                        req.newSession.flyer = rows[0].flyer_coupon;
                        console.log("Session Value + " + req.newSession.flyer);
                        // do the required redirect - function call
                        output_render (res, req.newSession.flyer);
                    } 
                    else {
                        // display error msg for unauthenticated user
                        console.log("Flyer Authentication Failed");
                        req.newSession.flyer = "No flyer Selected";
                        output_render (res, req.newSession.flyer);
                        // display error msg // UI change
                    }
                }
                else {
                    var msg = "Error while authenticating users through query + " + err;
                    console.log("Error while authenticating users through query + " + err);
                    res.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
                }
            });
        }
        else {
            var msg = "Disconnected DB + " + err;
            console.log("Disconnected DB + " + err);
                    res.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
            
        }
        connection.release();
    });
};

function output_render(res,flyer_data){
  res.render('prepflier.jade', { variables: {
      title: 'Urban Beats', flyer: flyer_data
  }
  });
};

exports.do_addflier = function(req, res){
	console.log("in do_addflier");
	query_db(req,res);
};

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

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
    else {
            console.log("Connected DB");
            connection.query("select count(*) as count from Flyer;", function(err, rows, fields) {
    			if(err){
                    var msg = "Error while selection into table +" + err;
	   		      console.log("Error while selection into table +" + err);
                                      res.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });

		      	}
			    else {
                    var flyer_val = 1;
                    if(rows.length == 0){
                        flyer_val = 1;
                    }
                    else {
                        flyer_val = (parseInt(rows[0].count) + 1);
                    }
                    var randStr = Math.random().toString(36).substring(7);
                    var flyerid = "--" + randStr + flyer_val;
        		    var dt = getDateTime();
        			var flyer = String(req.body.textarea);
        			console.log("values sent to db + " +  " flyer_id: " + flyer_val + " textarea " + flyer);
        			var values= {flyer_id:flyerid, business_id: req.newSession.business_id, flyer_coupon: flyer, is_accepted: "no", date_modified: dt, No_of_views: 0, No_of_selects: 0};
        			// inserting rows
        			connection.query('INSERT INTO Flyer SET ?',values,function(in_err,in_rows,in_fields){
        	    	    console.log("After Insert Query");
          	  			//connection.end(); // done with the connection
            			if ( in_err ){
                            var msg = "Error while inserting into table +" + in_err;
    		  		      console.log("Error while inserting into table +" + in_err);
                            res.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });

        	       		}
        			    else{
    					   console.log("data successfully inserted into the database");
                           // return;
                           // res.end();
                           res.redirect('/oldfliers');
          				   // functionality of display confirmation to business
        			    }
			}); // end connection.execute
		}   
    });
		connection.release();
    }
	}); // end sql.connect
}
