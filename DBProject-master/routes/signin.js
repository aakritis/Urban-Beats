var mysql      = require('mysql');
var newSession = require('client-sessions');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}

/*
 * GET home page, which is specified in Jade.
 */

exports.do_work = function(req, res){
  res.render('signin.jade', { 
	  title: 'Urban Beats' 
  });
  
};
exports.do_authenticate = function(request, response){
	console.log("do_work data + " + request.body.fname + "	+ " + request.body.pwd);
	query_db(request,response,request.body.fname,request.body.pwd);
};

exports.do_facebooklogin = function(request, response){
  console.log("[facebook] " + request.query.user + "  " + request.query.email);
  query_fb(request,response,request.query.user,request.query.email);
};

function query_fb(req,res,user,email){
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
    connection.query("SELECT * FROM User WHERE user_id='" + email + "'", function(err, rows, fields) {
      if(err){
        console.log("Error while selection into table +" + err);
      }
      else{
        if(rows.length == 0) {
          var values={first_name:user, last_name:"", user_id:email, password:"facebook", review_count:0, member_since:"2015-04", Sec_Ques1:"", Sec_Ans1:"", Sec_Ques2:"", Sec_Ans2:"", Sec_Ques3:"", Sec_Ans3:""};
          // inserting rows
          connection.query('INSERT INTO User SET ?',values,function(in_err,in_rows,in_fields){
          console.log("After Insert Query");
            //connection.end(); // done with the connection
            if ( in_err ){
              var msg= "Error while inserting into table +" + in_err;
              console.log("Error while inserting into table +" + in_err);
              response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
            }
            else{
              console.log("data successfully inserted into the database");
              //output_signup(res);
              req.newSession.user_id=email;
              output_filter(req,res);
            }
          }); // end connection.execute
        }
        else {
          // display error msg saying user exists
          console.log("User already exists"); 
          req.newSession.user_id=email;
          output_filter(req,res);

        }
      }
    });
    connection.release();
  }); // end sql.connect
}

function query_db(request,response,fname,pwd) {
	var connection_pool = mysql.createPool(connection);
	connection_pool.getConnection(function(err, connection){
	//connection.connect (function(err, connection) {
		if(!err) {
			console.log("Connected DB");
			connection.query("SELECT * FROM User WHERE user_id='" + fname + "' AND password='" + pwd + "'", function(err, rows, fields) {
				//connection.end(); // connection close
				if (!err) {
					//console.log("Results fetched + " + rows[0].first_name);
					if (rows.length > 0 ) {
						console.log("User Authenticated");
						// do the required redirect - function call 
						// setting the value of user_id in the session
						request.newSession.user_id=fname;
						output_filter(request,response);
					} 
					else {
						// display error msg for unauthenticated user
            var msg = "User Authentication Failed";
						console.log("User Authentication Failed");
            response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });
						// display error msg // UI change
					}
				}
				else {
          var msg  = "Error while authenticating users through query + " + err;
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
function output_filter(req,res)
{
	console.log("inside function to filter restaurants on the basis of city");

	var connection_pool=mysql.createPool(connection);
	connection_pool.getConnection(function(err,connection)
	{
       if(!err)
       {
       	 console.log("again got connected to DB inside output_filter page for filtering results on the basis of city");
       	 // fetching the first name of the user corresponding to the user_id stored in the session
       	 //console.log("\n User_id of the given user is as...."+req.newSession.user_id);
       	 var id=req.newSession.user_id;
       	 console.log("id of user..."+id);
       	 connection.query("SELECT * FROM User WHERE user_id='"+id+ "'" , function(err,rows,fields)
       	 	{
                if(!err)
                 {
                 	console.log("\n query got executed successfully.....");
                    if(rows.length==0)
                     {
                     	console.log("there is no such user registered in the database....");

                     }	
                     else
                      {
                      	
                      	console.log("Results fetched..."+rows[0].first_name);
                      	req.newSession.userName=rows[0].first_name;

                        connection.query("UPDATE User SET is_loggedIn="+1+" WHERE user_id='"+id+"'" , function(err, rows1, fields)
                        {

                           if(!err)
                           {
                             console.log("table got updated successfully..");
                           }
                           else
                           {
                              console.log("error in updating the table...");
                           }
                        });
                      	
                      	console.log("User name fetched....");
                      	var name=req.newSession.userName;
                      	console.log("User's first name fetched corresponding to his user_id..."+name);
                      }	
                 }	
                 else
                  {
                  	// display the error message
                    var msg = "Failed to fetch the user name corresponding to the user_id..."+err;
                  	console.log("Failed to fetch the user name corresponding to the user_id..."+err);
                                     response.render('errordisplay.jade', { variables:{
                                title: 'Urban Beats', error: msg
                                }
                            });

                     
                  }	
                 connection.release();
                 var name=req.newSession.userName;
                 console.log("user name here..."+name);
                  redirect_output(res,name);
       	 	});
       	    // query to fetch the attributes from the database
       	    /*
           connection.query("SELECT * FROM LIMIT 5", function(err,categoryResult,fields)
           	{

           		if(!err)
           		 {
           		 	console.log("fetching categories query got executed properly...");
           		 	if(rows.length==0)
           		 	 {
                        console.log("there isn't any category in the database...");
           		 	 }	
           		 	 else
           		 	 {
                        console.log("categories fetched from the database....");

                     }   
           		 }	
           		else
           		  {
           		  	console.log("Failed to fetch the categories from the database..."+err);
           		  }	
           	});*/
           

       }

       

	});
/*
  var name=req.newSession.userName;
  console.log("user name is..."+name);
  res.render('postlogin.jade', {variables:{ 
	  title: 'Urban Beats' , userName: name
  }});
*/
    
   
};
function redirect_output(res,name)
{
   console.log("Inside redirect output function......");	
  //var name=req.newSession.userName;
  console.log("user name is..."+name);
  res.render('postlogin.jade', {variables:{ 
	  title: 'Urban Beats' , userName: name
  }});

};