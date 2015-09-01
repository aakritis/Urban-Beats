var mysql      = require('mysql');
var newSession = require('client-sessions');
var connection = {
	host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
	user     : 'urbanbeatsdb',
	password : 'urbanbeatsdbpwd',
	database : 'UrbanBeatsDB'
}

exports.do_work = function(request,response)
{
	request.newSession.userName="";
    request.newSession.category = false;
    request.newSession.hasCategory = "";
    request.newSession.city = false;

    request.newSession.rating = false;
    request.newSession.ambience=false;
    request.newSession.takeout=false;
    request.newSession.delivery=false;
    request.newSession.alcohol=false;
    request.newSession.parking=false;
    request.newSession.outdoorSeating=false;
    request.newSession.hasRating=0;
    request.newSession.hasAmbience=" ";
    request.newSession.hasTakeout=" ";
    request.newSession.hasDelivery=" ";
    request.newSession.hasAlcohol=" ";
    request.newSession.hasParking=" ";
    request.newSession.hasOutdoorSeating=" ";
    query_db(request,response);
};

function query_db(request,response)
{
	var connection_pool = mysql.createPool(connection);
    connection_pool.getConnection(function(err,connection)
    {
       connection.query("UPDATE User SET is_loggedIn="+0+" WHERE user_id='"+request.newSession.user_id+"'",function(err,rows,filelds)
       {
           if(!err)
           {
           	 console.log("is loggedIn field updated successfully...");
           	 request.newSession.user_id="";
           }
           else
           {
           	 console.log("query didn't execute successfully....");
           }
         
       });
        connection.release();
        response.render('index.jade', { 
	    title: 'Urban Beats' 

    });
        
  });
};