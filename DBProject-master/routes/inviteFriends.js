var mysql      = require('mysql');
var newSession = require('client-sessions');
var nodemailer = require('nodemailer');
var twilio = require('twilio');
var connection = {
  host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
  user     : 'urbanbeatsdb',
  password : 'urbanbeatsdbpwd',
  database : 'UrbanBeatsDB'
}

exports.do_work=function(request,response)
{
   console.log("inside invite friends's do_work");
   query_db(request,response);
};
exports.sendSMS=function(request,response)
{
   console.log("inside send SMS function");
   var phone=request.body.phone;
   var code= "Your coupon id is:\t"+request.newSession.finalCouponId+"\nYour Coupon is:\t"+request.newSession.flyerCoupon;
   send_sms(code,phone,response);
};

function query_db(request,response)
{
  var connection_pool = mysql.createPool(connection);
  var flyer_id=request.newSession.selectedFlyerId;
  connection_pool.getConnection(function(err,connection)
  	{
  		// find friends of current user
  		var strQuery="SELECT friend_id FROM Friends WHERE login_id='"+request.newSession.user_id+"' LIMIT 1";
        connection.query(strQuery,function(err,friend,fields)
        {
        	if(!err)
        	 {
                console.log("friends fetched successfully...");
                // insert coupon into table
                 var timestamp = Number(new Date());
                 var randStr = Math.random().toString(36).substring(7);
                 var new_coupon_id= "--" + randStr + timestamp;
                 var values_insert={coupon_id:new_coupon_id, flyer_id: flyer_id, user_id: request.newSession.user_id, is_valid: 'yes'};
                 var insertQuery='INSERT INTO User_Flyer SET ?';
                 connection.query(insertQuery,values_insert,function(err,rows,fields)
                 	{
                 		if(!err)
                 		 {
                            console.log("coupon successfully inserted into the database...");
                            //fetch the coupon from the flyer table coressponding to the flyer_id
                            connection.query("SELECT flyer_coupon FROM Flyer WHERE flyer_id='"+flyer_id+"'",function(err,flyer,fields)
                            	{
                                   if(!err)
                                   {
                                      console.log("records fetched successfully from the flyer table...");
                                      // send email
                                       var transporter = nodemailer.createTransport();
					                   var to_val = friend[0].friend_id;
					                   console.log("friend_id..."+to_val);
					                   console.log("coupon.."+flyer[0].flyer_coupon);
					                   var mailoptions = 
					                     {
						                    from: ' "Aakriti Singla" <aakritisingla4490@gmail.com>', // sender address
    					     	            to: to_val, // list of receivers
    					     	            subject: 'Urban Beats: Invitation to try Coupon', // Subject line
    						                text: 'Your Coupon id is: ' + new_coupon_id+"\n"+"Your coupon is:\t"+flyer[0].flyer_coupon // plaintext body
    						     
						                 };

						                 transporter.sendMail(mailoptions,function(err,info)
						                 	{
                                                if(!err)
                                                 {
                                                    console.log("email sent successfully to your friend...");

                                                    //redirect_output_email(response);

                                                 }	
                                                 else
                                                  {
                                                     console.log("an error occurred while sending the email..."+err);
                                                     //redirect_output_email(response);

                                                  }	

						                 	});

                                   }
                                   else
                                   {

                                      console.log("error occurred while fetching records from flyer table");
                                   }

                            	});
                 		 }	
                 		 else
                 		 {
                              console.log("Problem while inserting the coupon into the database..."+err);
                 		 }	
                 	}); 
        	 }	
        	 else
        	 {
                console.log("error occurred while fetching the friends..."+err);
        	 }	
        });
  	});
  
};

function redirect_output_email(response)
{
	  response.render('index.jade', { 
	  title: 'Urban Beats' 
  });

};

function send_sms(code, phone,response) 
{
 	var client = new twilio.RestClient('AC997603cf5760391f8e39ce90192a3acf', '628746f7ce96f53fa50bc232d5e59d62');
 	client.sms.messages.create({
    	to:'+1'+phone,
    	from:'3017106565',
    	body: code
	}, function(error, message) {
    if (!error) 
    {
       console.log("sms sent successfully");
       redirect_output_email(response);
    } 
    else 
    {
        console.log('[Register.js] : Twilio Error'+error);
    }
	});
};