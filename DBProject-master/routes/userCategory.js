var mysql      = require('mysql');
var newSession = require('client-sessions');
var moment = require('moment');
/*
var geocoder = require('geocoder');
var navigator= require('navigator');
var geolocation=require('geolocation')
*/
var city;
var connection = {
  host     : 'urbanbeats.czeuio4ikmlz.us-east-1.rds.amazonaws.com',
  user     : 'urbanbeatsdb',
  password : 'urbanbeatsdbpwd',
  database : 'UrbanBeatsDB'
}

exports.notifyBusiness = function(request,response)
{
  var flyerIds=[];
  var flyerCoupons=[];

   var connection_pool = mysql.createPool(connection);
   
    //console.log("length of filtered results...."+request.newSession.filteredResults[0].business_id);
    var ids="(";
    for(var i=0;i<request.newSession.filteredResults.length;i++)
     {
        
        ids=ids+"'"+request.newSession.filteredResults[i].business_id+"',";
            
     }  

     var finalStr=ids.substring(0,ids.length-1);
     finalStr=finalStr+")";
     console.log("id string..."+finalStr);

    connection_pool.getConnection(function(err,connection)
    {
      
       
         console.log("[test int] +  " + i + " " + request.newSession.filteredResults.length);
         console.log(parseInt(i,10) === parseInt(request.newSession.filteredResults.length,10))
          var strQuery= "SELECT flyer_id,flyer_coupon FROM Flyer WHERE business_id IN "+finalStr+" and is_accepted='yes'";
          console.log("query...."+strQuery);
          connection.query(strQuery,function(err,rows,fields)
            {
                if(!err)
             {
              console.log("query got executed successfully....");
              if(rows.length==0)
               {
                console.log("no records fetched from the database");
               }  
               else
                {
                    var flyerStr="(";
                     console.log("flyer fetched");
                     for(var i=0;i<rows.length;i++)
                     {
                       flyerStr=flyerStr+"'"+rows[i].flyer_id+"',";
                       flyerIds.push(rows[i].flyer_id);
                       flyerCoupons.push(rows[i].flyer_coupon);
                     }  
                     var finalFlyer=flyerStr.substring(0,flyerStr.length-1);
                     finalFlyer=finalFlyer+")";
                     console.log(finalFlyer);
                     // update no_of_views of the flyer table
                     var updateQuery = "UPDATE Flyer SET No_of_views=No_of_views+1 WHERE flyer_id IN "+finalFlyer
                      console.log("update query..."+updateQuery);
                     connection.query(updateQuery,function(err,row,fields)
                     {
                        if(!err)
                         {
                            console.log("value of no_of_views got updated successfully");
                            // obtain the reviews of the corresponding business
                            connection.query("SELECT text FROM Review WHERE business_id IN "+finalStr,function(err,review,fields)
                              {
                                  if(!err)
                                   {
                                     console.log("reviews fetched successfully..."+review[0].text);
                                     redirect_notify(response,request.newSession.filteredResults,flyerIds,flyerCoupons,review);

                                   } 
                                   else
                                   {
                                     console.log("review selection failed...");
                                   }

                              });

                           
                         }  
                         else
                         {
                          console.log("an error occurred while updating the no_of_views...");
                         }  
                     });
                } 
             }  
             else
             {
              console.log("query didn't execute properly...");
             }  
              
            });


        
            console.log("length of flyerCoupons..."+flyerCoupons.length);

          
       
         
        connection.release();
       
    }); 

       
}

function redirect_notify(response,filteredResults,flyerIds,flyerCoupons,review)
{
   console.log("inside redirect notify function");
   console.log("length of flyerCoupons inside redirect..."+flyerCoupons.length);
   response.render('useroffers.jade', {variables: {
     title: 'Urban Beats' , business: filteredResults, flyerIds: flyerIds, flyerCoupons: flyerCoupons, review: review}});

         
    
};

exports.do_work = function(request,response)
 {
    console.log("Inside do_work page....category selected is..."+request.body.category);
    //console.log("before calling initialize function....");
    /*
    initialize();
    console.log("after calling initialize..."); 
    geo=navigator.geolocation
    console.log("geolocation object...."+geo);
    if( "geolocation" in navigator)
    {
      console.log("Navigator object...."+navigator);
      console.log("geolocation found in navigator...."+navigator.geolocation);
    }
    if (geo) 
    {
        console.log("Inside ");
        geo.getCurrentPosition(successFunction, errorFunction);
    } 
    */

    // testing Day and time for Business_Hours
    /* 
    var day = moment().format('dddd');
    var time = String(moment().format('HH:mm'));
    //var open = moment("17:00", "HH:mm");
    //var close = moment("23:00", "HH:mm");
    var open = "17:00";
    var close = "23:00";
    /*
    console.log("[compare]");
    console.log((open <= time) && (close >= time))
    console.log("[day-time] Day + " + day + " Time +  " + time);
    */
    request.newSession.category = true;
    request.newSession.hasCategory = request.body.category;
    request.newSession.city = true;

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
    category=request.body.category;
    query_db(request,response);
 };

 exports.do_work_new = function(request,response)
  {
     console.log("inside do_work_new");
     
     console.log("Request Body here...."+request.query);
     var checkBoxArray=request.query;
     var arr = Object.keys(checkBoxArray).map(function(key)
     {
         return checkBoxArray[key];
     });
     //console.log("query...."+arr[0]);
     //console.log("value..."+arr[1]);
     console.log("[debug] arr[1] +  " + arr[1]);
     if(arr[0] === "rating")
     {
       if(request.newSession.rating && request.newSession.hasRating == arr[1])
       {

          request.newSession.rating=false;
          request.newSession.hasRating=0;
       }   
       else
       {
         request.newSession.rating=true;
         request.newSession.hasRating=arr[1];
       }  
     } 
     else if(arr[0] === "ambience")
     {
        if(request.newSession.ambience && request.newSession.hasAmbience == arr[1])
        {
          request.newSession.ambience=false;
          request.newSession.hasAmbience="";
        }
        else
         { 
           request.newSession.ambience=true;
           request.newSession.hasAmbience=arr[1];
         } 
     }
     else if(arr[0] === "takeout")
     {
        if(request.newSession.takeout)
         {
           request.newSession.takeout=false;
           request.newSession.hasTakeout="";
         } 
         else
         {
            request.newSession.takeout=true;
            request.newSession.hasTakeout=arr[1];
         }
     }
     else if(arr[0] === "delivery")
     {
        if(request.newSession.delivery)
         {
            request.newSession.delivery=false;
             request.newSession.hasDelivery="";
         } 
         else
         {
           request.newSession.delivery=true;
           request.newSession.hasDelivery=arr[1];
        }
     }
     else if(arr[0] === "alcohol")
     {
        if(request.newSession.alcohol)
         {
          request.newSession.alcohol=false;
          request.newSession.hasAlcohol="";
         } 
         else
         {
           request.newSession.alcohol=true;
           request.newSession.hasAlcohol=arr[1];
         }  
     }
     else if(arr[0] === "parking")
     {
        if(request.newSession.parking)
        {
          request.newSession.parking=false;
          request.newSession.hasParking="";
        }
        else
         { 
           request.newSession.parking=true;
           request.newSession.hasParking=arr[1];
         }  
     }
     else if(arr[0] === "outdoorSeating")
     {
        if(request.newSession.outdoorSeating)
        {
          request.newSession.outdoorSeating=false;
          request.newSession.outdoorSeating="";
        }
        else
         { 
           request.newSession.outdoorSeating=true;
           request.newSession.hasOutdoorSeating=arr[1];
         }  
     }

    
     query_db(request,response);
  };
  /*
  //Get the latitude and the longitude;
function successFunction(position) 
{
    console.log("Inside the successFunction...");
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    codeLatLng(lat, lng)
};
 
function codeLatLng(lat, lng) 
  {
     console.log("Inside codeLatLong function");
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      console.log(results)
        if (results[1]) {
         //formatted address
         //alert("Adresss is:   "+results[0].formatted_address+"                      "+results[0])
        //find country name
             for (var i=0; i<results[0].address_components.length; i++) {
            for (var b=0;b<results[0].address_components[i].types.length;b++) {
            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (results[0].address_components[i].types[b] == "locality") 
                {
                    //this is the object you are looking for
                    city= results[0].address_components[i].short_name;
                    console.log("city name in which you are currently located is:..."+city);
                    break;
                }
            }
        }
        //city data
       // alert("City is:   "+city.short_name)
        } else {
          //alert("No results found");
        }
      } else {
        //alert("Geocoder failed due to: " + status);
      }
    });
  }
  // function to initialize the geocoder..
 function initialize() 
 {
    //geocoder = new google.maps.Geocoder();
 };
*/
 function query_db(request,response)
  {
    var category;
    var dbQuery;
    //var day = moment().format('dddd');
    var day = "Tuesday";
    //var time = String(moment().format('HH:mm'));
    var time="11:00";
    //var open = moment("17:00", "HH:mm");
    //var close = moment("23:00", "HH:mm");
    var open = "17:00";
    var close = "23:00";
    
    var connection_pool = mysql.createPool(connection);
    connection_pool.getConnection(function(err, connection)
    {
       if(!err)
       {
            console.log("Database connected...");
            console.log("category....."+request.newSession.category);
             //console.log("city here is..."+city_here);
         
             console.log("inside category and city....");

             dbQuery="SELECT name,TEMP.business_id,full_address,stars,review_count FROM";

             if(request.newSession.city)
              {
                 dbQuery=dbQuery+" (SELECT name,business_id,full_address,stars,review_count FROM Business WHERE Business.city='Las Vegas') TEMP"
              }            
              if(request.newSession.category)
               {
                dbQuery=dbQuery+" INNER JOIN (SELECT business_id FROM Business_Hours WHERE day='"+day+"' and open<= '"+time+"' and close>= '"+time+"')TEMPHOURS ON TEMP.business_id=TEMPHOURS.business_id INNER JOIN Business_Categories ON TEMP.business_id=Business_Categories.business_id INNER JOIN Categories ON Business_Categories.category_id=Categories.category_id INNER JOIN Attributes ON TEMP.business_id=Attributes.business_id WHERE Categories.category_name='"+request.newSession.hasCategory+"'"
               } 
               if(request.newSession.rating)
               {
                 dbQuery=dbQuery+" and stars>="+request.newSession.hasRating
               }
               if(request.newSession.ambience)
               {
                 var column_name="ambience_"+request.newSession.hasAmbience
                 dbQuery=dbQuery+" and Attributes."+column_name+"=1";
               }
               if(request.newSession.takeout)
               {
                 dbQuery=dbQuery+" and Attributes.take_out=1";
               }
               if(request.newSession.delivery)
               {
                 dbQuery=dbQuery+" and Attributes.delivery=1";
               }
               if(request.newSession.alcohol)
               {
                dbQuery=dbQuery+" and Attributes.alcohol NOT IN ('','none')";
               }
               if(request.newSession.parking)
               {
                 dbQuery=dbQuery+" and (Attributes.parking_lot=1 or Attributes.parking_street=1 or Attributes.parking_garage=1 or Attributes.parking_valet=1)";
               }
               if(request.newSession.outdoorSeating)
               {
                 dbQuery=dbQuery+" and Attributes.outdoor_seating=1";
               }
                dbQuery=dbQuery+" LIMIT 5";

               //if(request.session.)
               console.log("final query string...."+dbQuery)


            connection.query(dbQuery,function(err,business_rows_results,fields)
            {
              if(!err)
               {
                 // query got executed
                  if(business_rows_results.length == 0)
                    {
                      console.log("Records not fetched from the database....");
                      // display error page 
                    } 
                  else
                   {
                      connection.query("select name, flyer_coupon from ( select name, business_id from Business where is_premium = 'yes' ) TempBus inner join ( select flyer_coupon, business_id from Flyer where is_accepted = 'yes') TempFly on TempBus.business_id = TempFly.business_id order by RAND() limit 3;", function(err, rows, fields) {
                        if (!err) {
                          if (rows.length > 0 ) {
                            console.log("Premium Flyer Authenticated");
                            var arr_pbus = [];
                            var arr_pflyer = [];
                            var count = 0;
                            for (var row in rows){
                              arr_pbus.push(String(rows[row].name));
                              arr_pflyer.push(String(rows[row].flyer_coupon));
                              count++;
                            }
                            // do the required redirect - function call
                            redirect_output(request,response,business_rows_results,arr_pbus,arr_pflyer);
                          } 
                          else {
                            // display error msg for unauthenticated user
                            console.log("Premium Flyer Authentication Failed");
                            var arr_pbus = [];
                            var arr_pflyer = [];
                            redirect_output(request,response,business_rows_results,arr_pbus,arr_pflyer);
                          }
                        }
                        else {
                          console.log("Error while authenticating users through query + " + err);
                        }
                      });
                       console.log("records fetched from the database...."); 
                       
                      //request.newSession.city=city_here
                      //request.newSession.category=category
                      
                   }  
               } 
               else
                {
                   // query failed to execute
                   console.log("query didn't execute successfully..."+err);
                }
                connection.release(); 
                /*console.log("before redirecting the input");
                if(business_rows_results.length > 0) {
                  redirect_output(request,response,business_rows_results);
                }
                else {
                  console.log("No result fetched");
                }*/
            });
        }
        else
         {
            console.log("Problem in connecting with the database....");   
         } 

   });
  
  };

  function redirect_output(req,res,results,pbusiness,pflyer)
  {
    console.log("Inside Redirect Output from User Category");
   //console.log("[debug]Inside redirect output function......" + req.newSession.hasRating);  
    //console.log("values being passed are.....rating "+req.newSession.hasRating+"\tambience: "+req.newSession.hasAmbience+"\t takeout: "+req.newSession.hasTakeout+"\t alcohol: "+req.newSession.hasAlcohol+"\t delivery: "+req.newSession.hasDelivery+"\t parking: "+req.newSession.hasParking+"\t seating: "+req.newSession.hasOutdoorSeating);
     /*var business_ids=[]
     for(var i=0;i<results.length;i++)
     {
        business_ids.push(String(results[i].business_id));
     }
     req.newSession.business_ids=business_ids;*/
     req.newSession.filteredResults=results;
     res.render('useroptions.jade', {variables: {
     title: 'Urban Beats' , results: results, rating: req.newSession.hasRating, ambience: req.newSession.hasAmbience, takeout: req.newSession.hasTakeout, delivery: req.newSession.hasDelivery, alcohol: req.newSession.hasAlcohol, parking: req.newSession.hasParking, outdoorSeating: req.newSession.hasOutdoorSeating, arrpbus: pbusiness, arrpflyer: pflyer
   }
  });

};
