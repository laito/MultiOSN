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
        
        $("#last24").on('pageshow', function() {
			app.loadSentiments(true);
		});
        
        $("#page-home").on('pageshow', function() {
			app.geteventnames();
		});
        
        $("#youtube").on('pageshow', function() {
			app.loadYoutube();
		});
        
        $("#googleplus").on('pageshow', function() {
			app.loadGooglePlus();
		});
        
        $("#flickr").on('pageshow', function() {
			app.loadFlickr();
		});
        
        $("#twitter").on('pageshow', function() {
			app.loadTweets();
		});
        
        $("#facebook").on('pageshow', function() {
			app.loadFacebookPosts();
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
	

	htmlencode: function(value) {
        return $('<div/>').text(value).html();
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
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
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
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
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
	
    getFlickr: function(flickrphoto) {
		return '<img width="75" height="75" border="0" style="float:left" data-thumbdata="" class="pc_img" alt="'+flickrphoto.title+'" src="http://farm'+flickrphoto.farm+'.staticflickr.com/'+flickrphoto.server+'/'+flickrphoto.photo_id+'_'+flickrphoto.secret+'_s.jpg">';
		html = '<div class="photo-display-item">'
        		+'<div class="thumb">'
            		+'<span class="photo_container pc_s">'
						+'<a class="rapidnofollow" target="_blank" title="'+flickrphoto.title+'" href="http://www.flickr.com/photos/'+flickrphoto.nsid+'/'+flickrphoto.photo_id+'">'
							+'<img width="75" height="75" border="0" data-thumbdata="" class="pc_img" alt="'+flickrphoto.title+'" src="http://farm'+flickrphoto.farm+'.staticflickr.com/'+flickrphoto.server+'/'+flickrphoto.photo_id+'_'+flickrphoto.secret+'_s.jpg">'
						+'</a>'
            		+'</span>'
        		+'</div>'
    		+'</div>';
		return html;
	},
    
	loadFlickr: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractflickrdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {required : 'display', eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				html  = '';
				var jsonflickrdata = response;
				var resultcount = jsonflickrdata.results.length;
				for (var i = 0; i < resultcount; i++) {
					html += app.getFlickr(jsonflickrdata.results[i]);
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
        postdata = {};
        if (fromm === undefined && too === undefined) {
			if (useridorname === undefined) {
                // Normal POST for facebook posts
				postdata       =  {required : 'display', eventname : currentEvent};
			}
            else {
                // Facebook posts of a specific user
                postdata       = {required : 'uadisplay', eventname : useridorname, more: 0 }
						$.ajax({
							type       : "POST",
							url        : PreCogURL+"/functions/frontend/useranalysis/uacalldatascript.php",
							crossDomain: true,
							beforeSend : function() {$.mobile.showPageLoadingMsg();},
							complete   : function() {
								$.ajax({
									type       : "POST",
									url        : PreCogURL+"/functions/frontend/extractfacebookdata.php",
									crossDomain: true,
                                    beforeSend : function() { },
                                    complete   : function() { },
									data       : postdata,
									dataType   : 'json',
									success    : function(response) {
										if (response == null) {
											setTimeout(function(){ app.loadFacebookPosts(undefined,undefined,useridorname) },5000);
                                            $.mobile.showPageLoadingMsg();
                                            timeout = true;
                                            return;
										}
										else {
                                            $.mobile.hidePageLoadingMsg();
											html = '<ul class="twitter-content-listview" data-role="listview">';
											var jsonfbdata = response;
                                            
											var resultcount = jsonfbdata.results.length;
											for (var i = 0; i < resultcount; i++) {
												
												html += app.getFacebook(jsonfbdata.results[i],true);
											}
											html += '</ul>	';

											$("#facebook-content").html(html);
											$.mobile.changePage("#facebook");
											$('.timeago').timeago();
										}
									},
									error      : function() {      
									}
								}); 
							
							},
							data       : {network : 'facebook', useridorname : useridorname},
							dataType   : 'json',
							success    : function() {},
							error      : function() {}
						});
						return;
            }
        }   
        else {
            // Historical Facebook posts
            postdata       = {required : 'display', eventname : currentEvent, from: fromm, to: too}
        }
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractfacebookdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : postdata,
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
							//html += '<a onclick="app.loadTweets(undefined,undefined,\''+twittertweet.user_id+'\')"  data-role="button" >Load user tweets\
									//</a>';
                                html += ' <div data-role="controlgroup" data-type="horizontal" >\
                                            <a href="#popupBasic" data-rel="popup" data-role="button" data-icon="arrow-r" data-iconpos="right" >Analysis</a>\
                                          </div> ';
									
							}
                            html += '</li>';
		return html;
	},
	
	loadTweets: function(fromm,too,useridorname) {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		var tweetCount = localStorage.getItem("tweetCount");
		tweetCount++;
        timeout = false;
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
							beforeSend : function() {$.mobile.showPageLoadingMsg();},
							complete   : function() {
								$.ajax({
									type       : "POST",
									url        : PreCogURL+"/functions/frontend/extracttwitterdata.php",
									crossDomain: true,
                                    beforeSend : function() { },
                                    complete   : function() { },
									data       : postdata,
									dataType   : 'json',
									success    : function(response) {
										if (response == null) {
											setTimeout(function(){ app.loadTweets(undefined,undefined,useridorname) },5000);
                                            $.mobile.showPageLoadingMsg();
                                            timeout = true;
                                            return;
										}
										else {
                                            $.mobile.hidePageLoadingMsg();
											html = '<ul class="twitter-content-listview" data-role="listview">';
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
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
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
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg(); $("#twitter-panel-right").panel('close');},
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
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg(); $("#twitter-panel-right").panel('close');},
			data       : {required : 'display', eventname : currentEvent, sentiment: 'negative'},
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
	
	changeevent: function(currentEvent) {
		localStorage.setItem("currentEvent", currentEvent);
		var titleElements = document.getElementsByClassName('currentEventTitle');
		for(i = 0; i < titleElements.length; i++) {
			currentTitleElement = titleElements[i];
			currentTitleElement.innerText = currentEvent;
		}
        $("#main-panel").panel('close');
	},
	
	loadSentiments: function(last24) {
		oncethrough = 0;
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");

        var prefix = '';
        loadurl =  PreCogURL+"/functions/frontend/sentiment/extractsentimentdata.php";
        if(last24) {
            prefix = 'last24';
            loadurl = PreCogURL+"/functions/frontend/extractgraphdata.php";
        }
        $('#'+prefix+'chartdiv').html('');
		$.ajax({
			type       : "POST",
			url        : loadurl,
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				var obj  = response; 
				if(obj && obj.results !== null) {
					var count = obj.results.GooglePlus.length;
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
                        if(oncethrough == 0) {
                            minimum = obj.results.GooglePlus[i].hour;
                            oncethrough++;
                        }
						gplusPoints.push([obj.results.GooglePlus[i].hour + ':00', obj.results.GooglePlus[i].count]);
						fbPoints.push([obj.results.Facebook[i].hour + ':00', obj.results.Facebook[i].count]);
						twitterPoints.push([obj.results.Twitter[i].hour + ':00', obj.results.Twitter[i].count]);
						youtubePoints.push([obj.results.Youtube[i].hour + ':00', obj.results.Youtube[i].count]);
						flickrPoints.push([obj.results.Flickr[i].hour + ':00', obj.results.Flickr[i].count]);
					}
					
                    console.log(gplusPoints);
					  var plot3 = $.jqplot(prefix+'chartdiv', [gplusPoints, fbPoints, twitterPoints, youtubePoints, flickrPoints], 
						{ 
						  title:'Sentiments', 
						  // Series options are specified as an array of objects, one object
						  // for each series.
						  cursor:{
                                    show: true,
                                    zoom:true,
                                    showTooltip:true
                                },
                          axes:{
                               
                               xaxis:{
                                   labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                                   label: 'Time of Day',
                                   renderer:$.jqplot.DateAxisRenderer,
                                   //min: minimum+':00',
                                   
                                   tickOptions:{formatString:'%R', showGridline: false},
                                   tickInterval:'4 hours',
                                   autoscale: true

                               },
                               yaxis: {
                                    labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                                    label: 'Sentiment'
                               }
                           },
						    legend: {
								show: true,
								location: 's',     // compass direction, nw, n, ne, e, se, s, sw, w.
								xoffset: 12,        // pixel offset of the legend box from the x (or x2) axis.
								yoffset: 12,        // pixel offset of the legend box from the y (or y2) axis.
                                placement: 'outside',
                                renderer: $.jqplot.EnhancedLegendRenderer,
                                rendererOptions: {
                                    numberRows: 1
                                }
							},
						   series:[ 
							  {
								label: "Google+",
								showLabel : true,
								markerOptions: { style:'circle' }
							  }, 
							  {
								label: "Facebook",
								showLabel : true,
								markerOptions: { style:"circle" }
							  },
							  { 
								label: "Twitter",
								showLabel : true,
								markerOptions: { style:"circle" }
							  }, 
							  {
								label: "Youtube",
								showLabel : true,
								markerOptions: { style:"circle" }
							  },
							  {
								label: "Flickr",
								showLabel : true,
								markerOptions: { style:"circle" }
							  }
						  ]
						});
				}
				if(last24) {
				    $.mobile.changePage("#last24");
                } else {
                    $.mobile.changePage("#sentiment");
                }
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
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {functionname : 'geteventnames'},
			dataType   : 'json',
			success    : function(response) {
				var jsondata = response; 
				var html = '<ul data-filter="true" data-role="listview" id="main-panel-listview">';
				$.each(jsondata, function(i, v) {
					html += '<li class="clickable eventlistItems" onclick="app.changeevent(\''+v.eventname+'\')">'+v.eventname+'</li>';
				});
				html += '</ul>';
				$('#main-panel').html(html);
				$('#main-panel-listview').trigger('updatelayout');
				$("#main-panel-listview").listview().listview("refresh");
			},
			error      : function() {      
			}
		}); 
	}
	
};