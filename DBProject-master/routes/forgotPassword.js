var mysql      = require('mysql');
var newSession = require('client-sessions');
var nodemailer = require('nodemailer');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}

exports.do_work_render=function(request,response)
{
   response.render('forgotpwd.jade', { 
	  title: 'Urban Beats' 
  });
};
exports.do_work=function(request,response)
{
  console.log("Inside forgot password");
  query_db(request,response);
};

exports.sendEmail=function(request,response)
{
	console.log("inside sendEmail function...");
	var authenticate=false;

	var connection_pool = mysql.createPool(connection);
	console.log("User_id....."+request.newSession.user_id);
	connection_pool.getConnection(function(err,connection)
		{
           connection.query("SELECT password,Sec_Ans1,Sec_Ans2,Sec_Ans3 FROM User WHERE user_id='"+request.newSession.user_id+"'",function(err,rows,field)
           {
            if(!err)
            {
               console.log("password got fetched successfully...");
               if(rows.length==0)
                {
                	console.log("no rows fetched from the database...");
                }
                else
                 {
                 	// records fetched from database..
                 	console.log("to check if the questions got answered correctly...");
                    console.log(request.body.ans1+"\t"+rows[0].Sec_Ans1);
                    console.log(request.body.ans2+"\t"+rows[0].Sec_Ans2);
                    console.log(request.body.ans3+"\t"+rows[0].Sec_Ans3);


                 	if(request.body.ans1 === rows[0].Sec_Ans1 && request.body.ans2 === rows[0].Sec_Ans2 && request.body.ans3 === rows[0].Sec_Ans3)
                 	 {
                 	 	console.log("user answered the questions correctly...");
                 	 	// send email
                 	 	    var transporter = nodemailer.createTransport();
							         var to_val = request.newSession.user_id;
							         // var to_val = 'chaitanya2537@gmail.com';
							        var mailoptions = {
						         from: ' "Aakriti Singla" <aakritisingla4490@gmail.com>', // sender address
    					     	to: to_val, // list of receivers
    					     	subject: 'Urban Beats Password', // Subject line
    						    text: 'Your Password is: ' + rows[0].password // plaintext body
    						     //html: '<b>Hello world ✔</b>' // html body
						    	    };
							transporter.sendMail(mailoptions, function(error, info){
								if(error){
									console.log("Error while sending mail + " + error);
								}
								else{
									console.log("Successfully sent email");
									 redirect_output_email(response); 
								}
							});

                 	 }
                 	 else
                 	 {
                 	 	console.log("user didn't answer questions correctly...");
                 	 }	
                 }	

            }	
            else
            {
               console.log("problems while executing the query...");
            }

           });
              connection.release();
             	
		});
};

function query_db(request,response)
{
   var connection_pool = mysql.createPool(connection);
   request.newSession.user_id=request.body.email;
   console.log(request.newSession.user_id);
   connection_pool.getConnection(function(err,connection)
   	{
   		connection.query("SELECT Sec_Ques1,Sec_Ques2,Sec_Ques3 FROM User WHERE user_id='"+request.newSession.user_id+"'",function(err,rows,field)
   		{
           if(!err)
           {
              console.log("query got executed successfully...");
              if(rows.length==0)
              {
              	console.log("no records fetched from the database..");

              }
              else
              {
              	redirect_output(response,rows);
              }

           }
           else
           {
              console.log("error while executing the query...");
           }
           
   		});

   		 connection.release();
   		 

   	});
};

function redirect_output_email(response)
{
    response.render('signin.jade', {variables: {
     title: 'Urban Beats' 
   }});
};

function redirect_output(response,results)
{
    response.render('forgotpwdquestions.jade', {variables: {
     title: 'Urban Beats', results: results
   }});
};