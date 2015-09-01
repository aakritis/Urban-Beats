var newSession = require('client-sessions');

exports.do_work = function(request, res){
	var sess_name = request.newSession.business_name;
	var sess_category = request.newSession.business_categories;
	console.log("Session category + " + sess_category);
	// console.log("Session Captured + " + request.newSession.business_name + "	" + request.newSession.business_address + "	" + request.newSession.business_city + "	" + request.newSession.business_state + "	" + request.newSession.business_stars + "	" + request.newSession.business_categories + "	" + request.newSession.business_reviewcount);
  res.render('myinfo.jade', { variables:{
	  title: 'Urban Beats', name: sess_name, address: request.newSession.business_address, city: request.newSession.business_city, state: request.newSession.business_state, stars: request.newSession.business_stars, image: request.newSession.business_image, reviewcount: request.newSession.business_reviewcount, category: sess_category
  }
  });
};