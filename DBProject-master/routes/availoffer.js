var mysql      = require('mysql');
var newSession = require('client-sessions');
var nodemailer = require('nodemailer');
var connection = {
  host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
  user     : 'urbanbeatsdb',
  password : 'urbanbeatsdbpwd',
  database : 'UrbanBeatsDB'
}

exports.do_work=function(request,response)
{
   console.log("Inside do_work of avail offer function...");
   query_db(request,response);
};
function query_db(request,response)
{
	var connection_pool = mysql.createPool(connection);
    var checkbox = request.body;
	console.log(checkbox);
	var arr=[];
	arr = Object.keys(checkbox).map(function(key)
	{
        //console.log("key is..."+key);
        if(key === "finallevelusers[]")
        {	
          //console.log("inside if");
          return checkbox[key];
        }  
       
    });
    console.log("length of array..."+arr.length);
    console.log("Required values....\n"+arr[0]);

    var values=arr[0].split(";");
    request.newSession.selectedFlyerId=values[1];
    console.log(values[0]+"\t"+values[1]);

	connection_pool.getConnection(function(err,connection)
	 {
	 	var strQuery = "UPDATE Flyer SET No_of_selects=No_of_selects+1 WHERE business_id='"+values[0]+"' and flyer_id='"+request.body.flyer_id+"'";
	 	connection.query(strQuery,function(err,rows,filelds)
	 	 {
	 	 	if(!err)
	 	 	 {
                 console.log("no_of_selects coressponding to the flyer got updated successfully...");
                 // insert coupon in user_flyer
                 var timestamp = Number(new Date());
                 var randStr = Math.random().toString(36).substring(7);
                 var new_coupon_id= "--" + randStr + timestamp;
                 request.newSession.finalCouponId=new_coupon_id;
                 request.newSession.flyerCoupon=request.body.flyer_coupon;
                 var values_insert={coupon_id:new_coupon_id, flyer_id: values[1], user_id: request.newSession.user_id, is_valid: 'yes'};
                 var insertQuery='INSERT INTO User_Flyer SET ?';
                 connection.query(insertQuery,values_insert,function(err,result,fields)
                 {
                 	if(!err)
                 	{
                       console.log("records got inserted successfully...");
                       // if the query gets executed successfully send user an email regarding it
                       var transporter = nodemailer.createTransport();
					   var to_val = request.newSession.user_id;
					   var mailoptions = 
					   {
						        from: ' "Aakriti Singla" <aakritisingla4490@gmail.com>', // sender address
    					     	to: to_val, // list of receivers
    					     	subject: 'Urban Beats Coupon and Coupon_id', // Subject line
    						    text: 'Your Coupon id is: ' + new_coupon_id+"\n"+"Your coupon is:\t"+request.body.flyer_coupon // plaintext body
    						     //html: '<b>Hello world ✔</b>' // html body
						};
						transporter.sendMail(mailoptions, function(error, info)
						{
								if(error){
									console.log("Error while sending mail + " + error);
								}
								else
								{
									  console.log("Successfully sent email");
									  // fetch the business name and address
									  connection.query("SELECT name,full_address,Longitute,Latitude FROM Business WHERE business_id='"+values[0]+"'",function(err,business_rows,fields)
									  	{
									  		if(!err)
									  		 {
                                                console.log("records successfully fetched from the business table..");
                                                redirect_output_email(response,business_rows);

									  		 }	
									  		 else
									  		  {
                                                 console.log("error occurred while fetching data from the business table...."+err);
                                                 redirect_output_email(response,business_rows);

									  		  }	
									  	});
									  
								}
						});
                         
                 	}	
                 	else
                 	{
                 		console.log("records couldn't be inserted successfully.."+err);
                 	}	
                 });

	 	 	 }	
	 	 	 else
	 	 	  {
                 console.log("no_of_selects were not updated successfully...");
	 	 	  }	
	 	 });
	 });

};

function redirect_output_email(response,business_rows)
{
	console.log("directionsssss .... + " + business_rows[0].Latitude + "	" + business_rows[0].Longitute);
	 response.render('directions.jade', {variables: {
     title: 'Urban Beats' , business: business_rows}});

};