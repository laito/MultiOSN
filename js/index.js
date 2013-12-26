/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	
    // Application Constructor
    initialize: function() {
	
		var currentEvent = 'Mumbai';
		localStorage.setItem("PreCogURL", "http://precog.iiitd.edu.in/tools/beta/multiosnportal");
		localStorage.setItem("currentEvent", currentEvent);
		
		var titleElements = document.getElementsByClassName('currentEventTitle');
		
		for(i = 0; i < titleElements.length; i++) {
			currentTitleElement = titleElements[i];
			currentTitleElement.innerText = currentEvent;
		}
        
        this.bindEvents();
		this.geteventnames();
		var hash = window.location.hash.substring(1);
		console.log("WTF");
		console.log(hash);
		if(hash == "twitter") {
			this.loadTweets()
		}
		else if(hash == "facebook") {
			this.loadFacebookPosts();
		}
		else if(hash == "flickr") {
			this.loadFlickr();
		}
		else if(hash == "googleplus") {
			this.loadGooglePlus();
		}
		else if(hash == "youtube") {
			this.loadYoutube();
		}
		else if(hash == "sentiment") {
			//app.initializeCharts(true);
		}
		else {
			//app.initializeCharts(false);
		}
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		$( document ).bind( 'mobileinit', function(){
			$.mobile.loader.prototype.options.text = "loading";
			$.mobile.loader.prototype.options.textVisible = false;
			$.mobile.loader.prototype.options.theme = "a";
			$.mobile.loader.prototype.options.html = "";
		});
		$(document).bind('pagechange', function() {
			  $('.ui-page-active .ui-listview').listview('refresh');
			  $('.ui-page-active :jqmData(role=content)').trigger('create');
			  
		});
		$("#sentiment").on('pageshow', function() {
			app.loadSentiments();
		});
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    },
	
	initializeCharts: function(callback) {
		$.jqplot('chartdiv',  [[[1, 2],[3,5.12],[5,13.1],[7,33.6],[9,85.9],[11,219.9]]]);
		$.mobile.changePage("#sentiment");
		$.jqplot('chartdiv',  [[[1, 2],[3,5.12],[5,13.1],[7,33.6],[9,85.9],[11,219.9]]]);
		return;
		console.log("initCharts");
		//$("#sentimentchartdiv").html('');
		if(google.visualization === undefined) {
			google.load("visualization", "1", {packages:["corechart", "annotatedtimeline"], callback: function() {app.initializeCharts3(callback);}});
		} else {
			console.log('initCharts')
			app.initializeCharts3(false);
		}
	},
	
	
	initializeCharts3: function(callback) {
		console.log('initCharts3');
		if(callback) {
			console.log('initCharts3');
			setTimeout(app.loadSentiments,3000);
			
		}
		else {
			$.mobile.changePage("#sentiment");
		}
	},
	

	
	
	getYoutube: function(youtubevideo) {
		var timepublished = new moment.utc(youtubevideo.Uploaded_on).local();
		var timetoprint = timepublished.format("dddd, D MMMM YYYY") + ' at ' + timepublished.format('HH:mm:ss');
		html = '';
		html += '<li class="tweet-listview-item"><a href="'+youtubevideo.Watch_page+'">\
							\
							<h3 class="youtubetext" style="text-transform: none;">'+youtubevideo.Username+'</h3>\
							<h2><img class="youtubeimg" style="max-width:none;max-height:none;float:none;" alt="'+youtubevideo.Username+'" src="http://i.ytimg.com/vi/'+youtubevideo.Video_id+'/mqdefault.jpg" onError="this.onerror=null;this.src=\'img/default.png\';" /></h2>\
							<p class="youtubetext tweettime username timeago" title="'+timepublished.format()+'">'+timetoprint+' </p>\
							<p class="youtubetext username">'+youtubevideo.View_count+' Views</p>\
							<p class="youtubetext tweettext">'+youtubevideo.Video_title+'</p>\
							</a></li>';
		return html;
	},
	
	loadYoutube: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractyoutubedata.php",
			//url        : 'http://127.0.0.1/youtube.php',
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {required : 'display', eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				html = '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsonyoutubedata = response; //JSON.parse(response);
				var resultcount = jsonyoutubedata.results.length;
				for (var i = 0; i < resultcount; i++) {
					html += app.getYoutube(jsonyoutubedata.results[i]);
				}
				html += '</ul>	';
				$("#youtube-content").html(html);
				$.mobile.changePage("#youtube");
				$('.timeago').timeago();
			},
			error      : function() {      
			}
		}); 
	},
	
	getGoogle: function(gppost,divider) {
		var timepublished = new moment(gppost.published);
		var timetoprint = timepublished.format("dddd, D MMMM YYYY") + ' at ' + timepublished.format('HH:mm:ss');
		html = '';
		html += '<li data-icon="false" class="tweet-listview-item"><a href="'+gppost.actorurl+'">\
							<p class="my_icon_wrapper"><img class="tweetimgs" alt="'+ gppost.actordisplayName +'" src="'+gppost.actorimageurl+'" onError="this.onerror=null;this.src=\'img/default.png\';" /></p>\
							<h3 style="text-transform: none;">'+ gppost.actordisplayName +'</h3>\
							<span class="tweettime username"><p class="tweettime username timeago" title="'+gppost.published+'">'+timetoprint+'</p></span>\
							<p class="tweettext username">'+gppost.verb+'</p>\
							<p class="tweettext username">'+gppost.content+' <hr>';
							if (gppost.attachmentsimageurl.replace(/~$/, "") != '') {
								html += '<span><img class="gplusattachment" src="'+gppost.attachmentsimageurl.replace(/~$/, "")+'"></span>';
							}
							html += '<p class="tweettext username"><a class="tweettext username" style="font-size:0.8em" target="_blank" href="'+gppost.attachmentsurl.replace(/~$/, "")+'">'+gppost.attachmentsdisplayName.replace(/~$/, "")+'</a></p>\
							';
							if(gppost.objectactorimageurl.replace(/~$/, "") != '') {
								html += '<img class="gplusattachmentobject" src="'+gppost.objectactorimageurl.replace(/~$/, "")+'">';
							}
							html += '<p class="tweettext username">'+gppost.attachmentscontent.replace(/~$/, "")+'</p>';
							if(divider === 1) {
							html += '<a onclick="app.loadFacebookPosts(undefined,undefined,\''+gppost.actorid+'\')" data-rel="dialog" data-transition="slideup">Load user tweets\
									</a></p>\
									</li>'
							}
		return html;
	},
	
	loadGooglePlus: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractgoogleplusdata.php",
			//url		   : 'http://127.0.0.1/google.php',
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {required : 'display', eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {			
				html = '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsongpdata = response; //JSON.parse(response);
				var resultcount = jsongpdata.results.length;
				for (var i = 0; i < resultcount; i++) {
					html += app.getGoogle(jsongpdata.results[i]);
				}
				html += '</ul>	';
				$("#google-content").html(html);
				$.mobile.changePage("#googleplus");
				$('.timeago').timeago();
			},
			error      : function() {      
			}
		}); 
	},
	
	loadFlickr: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractflickrdata.php",
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {required : 'display', eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				html  = '';
				var jsonflickrdata = response; //JSON.parse(response);
				var resultcount = jsonflickrdata.results.length;
				for (var i = 0; i < resultcount; i++) {
					html += app.getformatedflickrphotohtml(jsonflickrdata.results[i]);
				}
				$("#flickr-content").html(html);
				$.mobile.navigate("#flickr");
				$('.timeago').timeago();
			},
			error      : function() {      
			}
		}); 
	},
	
	getFacebook: function(fbpost,divider) {
		var timepublished = new moment(new moment.utc(fbpost.created_time).local());
		var timetoprint = timepublished.format("dddd, D MMMM YYYY") + ' at ' + timepublished.format('HH:mm:ss');
		var post;
		if (fbpost.message != '') {
			post = app.htmlencode(fbpost.message);
		} else { 
			post = app.htmlencode(fbpost.story);
		}
		html = '';
		html += '<li class="tweet-listview-item"><a href="http://www.facebook.com/'+fbpost.from_id+'">\
							<p class="my_icon_wrapper"><img class="tweetimgs" alt="'+app.htmlencode(fbpost.name)+'" src="http://graph.facebook.com/'+fbpost.from_id+'/picture" onError="this.onerror=null;this.src=\'img/default.png\';" /></p>\
							<h3 style="text-transform: none;">'+app.htmlencode(fbpost.name)+'</h3>\
							<p class="tweettime username timeago" title="'+timepublished.format()+'">'+timetoprint+'\</p>\
							<p class="tweettext">'+post+'\</p>\
							</a>';
							if(divider === undefined) {
							html += '<a onclick="app.loadFacebookPosts(undefined,undefined,\''+fbpost.from_id+'\')" data-rel="dialog" data-transition="slideup">Load user tweets\
									</a>\
									</li>'
							}
		return html;
	},
	
	loadFacebookPosts: function(fromm,too,useridorname) {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractfacebookdata.php",
			//url		   : 'http://127.0.0.1/facebook.php',
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {required : 'display', eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				html = '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsonfbdata = response; //JSON.parse(response);
				var resultcount = jsonfbdata.results.length;
				for (var i = 0; i < resultcount; i++) {
					html += app.getFacebook(jsonfbdata.results[i]);
				}
				html += '</ul>	';
				$("#facebook-content").html(html);
				$.mobile.changePage("#facebook");
				$('.timeago').timeago();
			},
			error      : function() {      
			}
		}); 
	},
	
	getHistoricalTweets: function() {
		
	},
	
	getTweet: function(twittertweet,divider) {
		var timepublished = new moment(twittertweet.tweet_created_at);
		var timetoprint = timepublished.format("dddd, D MMMM YYYY") + ' at ' + timepublished.format('HH:mm:ss');
		
		html = '';
		html += '<li class="tweet-listview-item"><a href="http://twitter.com/'+twittertweet.user_screen_name+'/status/'+twittertweet.tweet_id+'">\
							<p class="my_icon_wrapper"><img class="tweetimgs" alt="'+twittertweet.user_screen_name+'" src="'+twittertweet.user_profile_image_url+'" onError="this.onerror=null;this.src=\'img/default.png\';" /></p>\
							<h3 style="text-transform: none;">'+twittertweet.user_name+' <span class="username tweetuser"><span>@</span>'+twittertweet.user_screen_name+'</span></h3>\
							<p class="tweettime username timeago" title="'+timepublished.format()+'">'+timetoprint+'\</p>\
							<p class="tweettext">'+twittertweet.tweet_text+'\</p>\
							</a>';
							if(divider === undefined) {
							html += '<a onclick="app.loadTweets(undefined,undefined,\''+twittertweet.user_id+'\')" data-rel="dialog" data-transition="slideup">Load user tweets\
									</a>\
									</li>'
							}
		return html;
	},
	
	loadTweets: function(fromm,too,useridorname) {
		console.log("LOADING TWEETS");
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		var tweetCount = localStorage.getItem("tweetCount");
		tweetCount++;
		localStorage.setItem("tweetCount",tweetCount);
		postdata = {};
		if (fromm === undefined && too === undefined) {
			if (useridorname === undefined) {
				postdata       = {required : 'display', eventname : currentEvent}
			}
			else {
						postdata       = {required : 'uadisplay', eventname : useridorname, more: 0 }
						$.ajax({
							type       : "POST",
							url        : PreCogURL+"/functions/frontend/useranalysis/uacalldatascript.php",
							crossDomain: true,
							beforeSend : function() {},
							complete   : function() {
								$.ajax({
									type       : "POST",
									url        : PreCogURL+"/functions/frontend/extracttwitterdata.php",
									crossDomain: true,
									beforeSend : function() {},
									complete   : function() {},
									data       : postdata,
									dataType   : 'json',
									success    : function(response) {
										if (false && response == null) {
											app.loadTweets(undefined,undefined,useridorname);
										}
										else {
											html = '<ul class="twitter-content-listview" data-role="listview"   >';
											var jsontwitterdata = response;
											var resultcount = jsontwitterdata.results.length;
											for (var i = 0; i < resultcount; i++) {
												
												html += app.getTweet(jsontwitterdata.results[i],true);
											}
											html += '</ul>	';
											
											$("#twitter-content").html(html);
											$.mobile.changePage("#twitter");
											$('.timeago').timeago();
										}
									},
									error      : function() {      
									}
								}); 
							
							},
							data       : {network : 'twitter', useridorname : useridorname},
							dataType   : 'json',
							success    : function() {},
							error      : function() {}
						});
						return;
			}
		}
		else {
			postdata       = {required : 'display', eventname : currentEvent, from: fromm, to: too}
		}
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extracttwitterdata.php",
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : postdata,
			dataType   : 'json',
			success    : function(response) {
					html = '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
					var jsontwitterdata = response; //JSON.parse(response);
					var resultcount = jsontwitterdata.results.length;
					for (var i = 0; i < resultcount; i++) {
						html += app.getTweet(jsontwitterdata.results[i]);
					}
					html += '</ul>	';
					
					$("#twitter-content").html(html);
					$.mobile.changePage("#twitter");
					$('.timeago').timeago();
			},
			error      : function() {      
			}
		}); 
	},
	
	loadPositiveTweets: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extracttwitterdatasentiment.php",
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {required : 'display', eventname : currentEvent, sentiment: 'positive'},
			dataType   : 'json',
			success    : function(response) {
				html = '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsontwitterdata = response;
				var resultcount = jsontwitterdata.results.length;
				for (var i = 0; i < resultcount; i++) {
					html += app.getTweet(jsontwitterdata.results[i]);
				}
				html += '</ul>	';
				
				$("#twitter-content").html(html);
				$.mobile.changePage("#twitter");
				$('.timeago').timeago();
			},
			error      : function() {      
			}
		}); 
	},
	
	loadNegativeTweets: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extracttwitterdatasentiment.php",
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {required : 'display', eventname : currentEvent, sentiment: 'negative'},
			dataType   : 'json',
			success    : function(response) {
				html = '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsontwitterdata = response; //JSON.parse(response);
				var resultcount = jsontwitterdata.results.length;
				for (var i = 0; i < resultcount; i++) {
					html += app.getTweet(jsontwitterdata.results[i]);
					//html += app.getformatedtwittertweethtml(jsontwitterdata.results[i]);
				}
				html += '</ul>	';
				
				
				$("#twitter-content").html(html);
				$.mobile.changePage("#twitter");
				$('.timeago').timeago();
			},
			error      : function() {      
			}
		}); 
	},
	
	changeevent: function(currentEvent) {
		localStorage.setItem("currentEvent", currentEvent);
		var titleElements = document.getElementsByClassName('currentEventTitle');
		for(i = 0; i < titleElements.length; i++) {
			currentTitleElement = titleElements[i];
			currentTitleElement.innerText = currentEvent;
		}
	},
	
	loadSentiments: function() {
		console.log("init");
		var prefix = '';
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		//app.initializeCharts();
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/sentiment/extractsentimentdata.php",
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				console.log("init3");
				console.log(google.visualization);
				var obj  = response; //JSON.parse(response);;
				if(obj && obj.results !== null) {
					var count = obj.results.GooglePlus.length;
					console.log("LENGTH IS "+count);
					var post_array = [];
					var post_count = [];

					post_array[0] = [];
					post_array[0][0] = 'Hour';
					post_array[0][1] = 'G+';
					post_array[0][2] = 'FB';
					post_array[0][3] = 'Twitter';
					post_array[0][4] = 'YouTube';
					post_array[0][5] = 'Flickr';
					var gplusPoints = [];
					var fbPoints = [];
					var twitterPoints = [];
					var youtubePoints = [];
					var flickrPoints = [];
					var endvalue = 0;
					for (var i = 0; i < count; i++) {
						gplusPoints.push([obj.results.GooglePlus[i].hour, obj.results.GooglePlus[i].count]);
						fbPoints.push([obj.results.Facebook[i].hour, obj.results.Facebook[i].count]);
						twitterPoints.push([obj.results.Twitter[i].hour, obj.results.Twitter[i].count]);
						youtubePoints.push([obj.results.Youtube[i].hour, obj.results.Youtube[i].count]);
						flickrPoints.push([obj.results.Flickr[i].hour, obj.results.Flickr[i].count]);
					}
								 
					  var plot3 = $.jqplot('chartdiv', [gplusPoints, fbPoints, twitterPoints, youtubePoints, flickrPoints], 
						{ 
						  title:'Line Style Options', 
						  // Series options are specified as an array of objects, one object
						  // for each series.
						   axes:{xaxis:{renderer:$.jqplot.DateAxisRenderer}},
						    legend: {
								show: true,
								location: 'ne',     // compass direction, nw, n, ne, e, se, s, sw, w.
								xoffset: 12,        // pixel offset of the legend box from the x (or x2) axis.
								yoffset: 12,        // pixel offset of the legend box from the y (or y2) axis.
							},
						   series:[ 
							  {
								// Change our line width and use a diamond shaped marker.
								label: "Google+",
								showLabel : true,
								markerOptions: { style:'circle' }
							  }, 
							  {
								// Don't show a line, just show markers.
								// Make the markers 7 pixels with an 'x' style
								label: "Facebook",
								showLabel : true,
								markerOptions: { style:"circle" }
							  },
							  { 
								// Use (open) circlular markers.
								label: "Twitter",
								showLabel : true,
								markerOptions: { style:"circle" }
							  }, 
							  {
								// Use a thicker, 5 pixel line and 10 pixel
								// filled square markers.
								label: "Youtube",
								showLabel : true,
								markerOptions: { style:"circle" }
							  },
							  {
								// Use a thicker, 5 pixel line and 10 pixel
								// filled square markers.
								label: "Flickr",
								showLabel : true,
								markerOptions: { style:"circle" }
							  }
						  ]
						});
				}
				
				$.mobile.changePage("#sentiment");
			},
			error      : function() {}
		}); 
	},
	
	geteventnames: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var tweetCount = localStorage.getItem("tweetCount");
		tweetCount = 0;
		localStorage.setItem("tweetCount",tweetCount);
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/stats.php",
			crossDomain: true,
			beforeSend : function() {},
			complete   : function() {},
			data       : {functionname : 'geteventnames'},
			dataType   : 'json',
			success    : function(response) {
				var jsondata = response; //JSON.parse(response);
				var html = '<ul data-filter="true" data-role="listview" id="main-panel-listview">';//'<div class="ui-panel-inner"><ul data-role="listview" class="ui-listview">';
				$.each(jsondata, function(i, v) {
					html += '<li class="clickable eventlistItems" onclick="app.changeevent(\''+v.eventname+'\')">'+v.eventname+'</li>';
				});
				html += '</ul>';//</div>';
				$('#main-panel').html(html);
				$('#main-panel-listview').trigger('updatelayout');
				$("#main-panel-listview").listview().listview("refresh");
			},
			error      : function() {      
			}
		}); 
	}
	
};