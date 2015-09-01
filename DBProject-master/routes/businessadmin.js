var mysql      = require('mysql');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}

exports.do_work = function(req, res){
  // var timestamp = Number(new Date()); 
  // console.log("Creating Business in_fields +    " + timestamp + "       " + randStr);
  res.render('businessadmin.jade', { 
	  title: 'Urban Beats' 
  });
};

exports.do_register = function(req, res){
	console.log("in do_register");
	//console.log("values recieved + " + req.body.firname + " " + req.body.lasname + " " + req.body.fname + " " + req.body.pwd);
    //console.log("security questions + " + req.body.secques1 + " " + req.body.secans1);
    //console.log("security questions + " + " Sec_Ques1: " + req.body.secques1 + " Sec_Ans1: " + req.body.secans1 + " Sec_Ques2: " + req.body.secques2 + " Sec_Ans2: " + req.body.secans2 + " Sec_Ques3: " + req.body.secques3 + " Sec_Ans3: " + req.body.secans3);
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
    console.log("Connected DB");
    connection.query("select count(*) as count from Business order by Date desc limit 1;", function(err, rows, fields) {
			if(err){
                var msg = "Error while selection into table +" + err;
				console.log("Error while selection into table +" + err);
                res.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
			}
			else{
				if(rows.length == 0) {
				    // display error message to tell unique business id not fetched 
                    res.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: "Business Id not generated"
                                }
                            });
				}
				else {
					var business_val = (parseInt(rows[0].count) + 1);
                    var randStr = Math.random().toString(36).substring(7);
                    var businessid = "--" + randStr + business_val;
        			var member_since = getDateTime();
    			    var categories = String(req.body.category).replace(',',';');
    			    //console.log("values sent to db + " +  " business_id: " + businessId + " name: " + req.body.bname +  " full_address: " + req.body.baddr + " city: " + req.body.city + " state: " + req.body.state + " categories: " + categories + " email: " + req.body.email +  " Date: " + member_since);
    			    var values= {business_id:businessid, name:req.body.bname, full_address:req.body.baddr, city:req.body.city, state:req.body.state, stars:0.0, review_count:0, categories:categories, open:1, email:req.body.email, Date:member_since};
    			    // inserting rows
    			    connection.query('INSERT INTO Business SET ?',values,function(in_err,in_rows,in_fields){
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
                            res.redirect('/businessadmin');
      				// functionality of send email confirmation to the business 
    				}
				}); // end connection.execute
			}
		}
    });
		connection.release();
	}); // end sql.connect
}
