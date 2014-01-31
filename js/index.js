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
			currentTitleElement.innerHTML = '<i class="fa fa-'+currentTitleElement.id+'"></i> '+currentEvent;
		}
        
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        
        $('#twitter').live("swipeleft", function(){
            $("#twitter-panel-right").panel('open');
        });
        
        $('#twitter').live("swiperight", function(){
            $("#twitter-panel-right").panel('close');
        });
        
        document.addEventListener('deviceready', this.onDeviceReady, false);
		$( document ).bind( 'mobileinit', function(){
			$.mobile.loader.prototype.options.text = "loading";
			$.mobile.loader.prototype.options.textVisible = false;
			$.mobile.loader.prototype.options.theme = "a";
			$.mobile.loader.prototype.options.html = "";
		});
        
		$(document).bind('pagechange', function() {
            //alert('pagechange');
			$('.ui-page-active .ui-listview').listview('refresh');
			$('.ui-page-active :jqmData(role=content)').trigger('create');
		});
        
        $(document).bind('pageshow', function() {
            localStorage.setItem("page",0);
        });
        
        $("#globe").on('pageshow', function() {
			app.loadMap();
		});
        
        
		$("#sentiment").on('pageshow', function() {
			app.loadSentiments();
		});
        
        $("#last24").on('pageshow', function() {
			app.loadSentiments(true);
		});
        
        $("#page-home").on('pageshow', function() {
			localStorage.setItem('GraphMode','');
                        
            $("#facebook-content").html('');
            $("#twitter-content").html('');
            $("#flickr-content").html('');
            $("#google-content").html('');
            $("#youtube-content").html('');
            $("#chartdiv").html('');
            $("#last24chartdiv").html('');
		});
        
        $("#eventsPage").on('pageshow', function() {
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
         
        $("#tagcloud").on('pageshow', function() {
			app.loadTagCloud();
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
    
    loadMore:   function(network) {
        var page = localStorage.getItem("page");
        if(page === null || page <= 0) {
            page = 1;
        }
        localStorage.setItem("page",parseInt(page)+1);
        app.loadTweets(undefined,undefined,undefined,page);
    },
    
    loadTagCloud: function(user) {
        var osn = localStorage.getItem('TagCloud');
        var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        if(user !== undefined) {
            url = '/functions/frontend/uagettagcloud.php';
            postdata = {eventname: currentEvent, osn: osn};
        } else {
            url = '/functions/frontend/tagcloudscripts/gettagcloud.php';
            postdata = {eventname: currentEvent, osn: osn};
        }
        tagCLoudTitle = document.getElementById("tagcloudTitle");
        tagCLoudTitle.innerHTML = "<i class='fa fa-"+osn.toLowerCase()+"'> "+osn;
        $.ajax({
			type       : "POST",
			url        : PreCogURL+url,
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : postdata,
			dataType   : 'html',
			success    : function(response) {
                 console.log("QWEWASDSQE");
                 console.log(response);
                response = response.replace(/<ul>/g,'');
                response = response.replace(/<li>/g,'');
                response = response.replace(/<\/ul>/g,'');
                response = response.replace(/<\/li>/g,'');
                response = response.replace(/a href="#"/g,'span')
                response = response.replace(/<\/a>/g,'</span>');
                console.log(response);
                $("#wordcloud").html(response);
                var settings = {
                    "size" : {
                        "grid" : 16
                    },
                    "options" : {
                        "color" : "random-dark",
                        "printMultiplier" : 3
                    },
                    "font" : "Futura, Helvetica, sans-serif",
                    "shape" : "square"
                }
                $( "#wordcloud" ).awesomeCloud( settings );
            },
            error      : function() {}
        }); 
        
        
    },
    
    setGooglePlusMarkers: function(map, user) {
        var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        var image = {
          url: 'img/googleplusmarker.png',
        };
        var shape = {
            coord: [1, 1, 1, 20, 18, 20, 18 , 1],
            type: 'poly'
        };
        var infoWindow = [];
        var required = 'map';
        if(user !== undefined) {
            required = 'uamap';
        }
        // AJAX Call
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractgoogleplusdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {required : required, eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				
                if(response) {
                    obj = response;
                    var count = obj.results.length;
                    for (var i = 0; i < count; i++) {
                        var post = obj.results[i];
                        
                        var html = app.getGoogle(post);
                        var myLatLng = new google.maps.LatLng(post.position_latitude, post.position_longitude);
                        var marker = new google.maps.Marker({
                          position: myLatLng,
                          map: map,
                          icon: image,
                          shape: shape,
                          html: html,
                        });
                      
                        var infoWindow = new google.maps.InfoWindow();
                            google.maps.event.addListener(marker, 'click', function() {
                                infoWindow.setContent(this.html);
                                infoWindow.open(map,this);
                            });
                    }    
                }
                
				//$.mobile.changePage("#globe");
			},
			error      : function() {      
			}
		}); 
        $('.useranalysismaploader').css('display', 'none');
        
    },
    
    setFacebookMarkers: function(map, user) {
        var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        var image = {
          url: 'img/facebookmarker.png',
        };
        var shape = {
            coord: [1, 1, 1, 20, 18, 20, 18 , 1],
            type: 'poly'
        };
        var infoWindow = [];
        var required = 'map';
        if(user !== undefined) {
            required = 'uamap';
        }
        // AJAX Call
        $.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractfacebookdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {required : required, eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
                if(response) {
                    obj = response;
                    var count = obj.results.length;
                    for (var i = 0; i < count; i++) {
                        var post = obj.results[i];
                        
                        var html = app.getFacebook(post);
                        html = html.replace("<br />", "");
                        var myLatLng = new google.maps.LatLng(post.latitude, post.longitude);
                           var marker = new google.maps.Marker({
                              position: myLatLng,
                              map: map,
                              icon: image,
                              shape: shape,
                              title: post.message,
                              html: html,
                            });
                      
                       
                        var infoWindow = new google.maps.InfoWindow();
                            google.maps.event.addListener(marker, 'click', function() {
                                infoWindow.setContent(this.html);
                                infoWindow.open(map,this);
                            });
                    }    
                }
                
				//$.mobile.changePage("#globe");
			},
			error      : function() {      
			}
		}); 
        $('.useranalysismaploader').css('display', 'none');
    },
    
    setTwitterMarkers: function(map, user) {
        var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        var image = {
          url: 'img/twittermarker.png',
        };
        var shape = {
            coord: [1, 1, 1, 20, 18, 20, 18 , 1],
            type: 'poly'
        };
        var infoWindow = [];
        var required = 'map';
        if(user !== undefined) {
            required = 'uamap';
        }
        // AJAX Call
        $.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extracttwitterdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {required : required, eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				
                if(response) {
                    obj = response;
                    var count = obj.results.length;
                    for (var i = 0; i < count; i++) {
                        var post = obj.results[i];
                        
                        var html = app.getTweet(post);
                        var tcoordinates = post.tweet_coordinates.split("[");
                        var longitude = tcoordinates[1].split(",");
                        var latitude = longitude[1].split("]");
                        var myLatLng = new google.maps.LatLng(latitude[0], longitude[0]);
                        var marker = new google.maps.Marker({
                          position: myLatLng,
                          map: map,
                          icon: image,
                          shape: shape,
                          title: post.tweet_text,
                          html: html
                        });
                      
                        var infoWindow = new google.maps.InfoWindow();
                            google.maps.event.addListener(marker, 'click', function() {
                                infoWindow.setContent(this.html);
                                infoWindow.open(map,this);
                            });
                    }    
                }
                
				//$.mobile.changePage("#globe");
			},
			error      : function() {      
			}
		}); 
        $('.useranalysismaploader').css('display', 'none');
    },
    
    setYoutubeMarkers: function(map, user) {
        var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        var image = {
          url: 'img/youtubemarker.png',
        };
        var shape = {
            coord: [1, 1, 1, 20, 18, 20, 18 , 1],
            type: 'poly'
        };
        var infoWindow = [];
        var required = 'map';
        if(user !== undefined) {
            required = 'uamap';
        }
        // AJAX Call
        $.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractyoutubedata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {required : required, eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				
                if(response) {
                    obj = response;
                    var count = obj.results.length;
                    for (var i = 0; i < count; i++) {
                        var post = obj.results[i];
                        var html = app.getYoutube(post);
                        var myLatLng = new google.maps.LatLng(post.lat, post.lon);
                        var marker = new google.maps.Marker({
                          position: myLatLng,
                          map: map,
                          icon: image,
                          shape: shape,
                          title: post.Video_title,
                          html: html,
                        });
                      
                        var infoWindow = new google.maps.InfoWindow();
                        google.maps.event.addListener(marker, 'click', function() {
                            infoWindow.setContent(this.html);
                            infoWindow.open(map,this);
                        });
                    }    
                }
                
				//$.mobile.changePage("#globe");
			},
			error      : function() {      
			}
		}); 
        $('.useranalysismaploader').css('display', 'none');
    },
    
    filter: function(network) {
        
        from = $("#from").attr('epoch');
        to = $("#to").attr('epoch');
        console.log(network);
        if(network === 'twitter') {
            app.loadTweets(from,to);
        }
        else if(network === 'facebook') {
            app.loadFacebookPosts(from,to);
        }
        else if(network === 'flickr') {
            app.loadFlickr(from,to);
        }
        else if(network === 'google') {
            app.loadGooglePlus(from,to);
        }
        else if(network === 'youtube') {
            app.loadYoutube(from,to);
        }
    },
    
    setFlickrMarkers: function(map, user) {
        var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        var image = {
          url: 'img/flickrmarker.png',
        };
        var shape = {
            coord: [1, 1, 1, 20, 18, 20, 18 , 1],
            type: 'poly'
        };
        var infoWindow = [];
        var required = 'map';
        if(user !== undefined) {
            required = 'uamap';
        }
        // AJAX Call
        $.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractflickrdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {required : required, eventname : currentEvent},
			dataType   : 'json',
			success    : function(response) {
				
                if(response) {
                    obj = response;
                    var count = obj.results.length;
                    for (var i = 0; i < count; i++) {
                        var post = obj.results[i];
                        var html = app.getFlickr(post);
                        var myLatLng = new google.maps.LatLng(post.latitude, post.longitude);
                        var marker = new google.maps.Marker({
                          position: myLatLng,
                          map: map,
                          icon: image,
                          shape: shape,
                          title: post.description,
                          html: html,
                        });
                      
                        var infoWindow = new google.maps.InfoWindow();
                        google.maps.event.addListener(marker, 'click', function() {
                            infoWindow.setContent(this.html);
                            infoWindow.open(map,this);
                        });
                    }    
                }
                
				//$.mobile.changePage("#globe");
			},
			error      : function() {      
			}
		}); 
        $('.useranalysismaploader').css('display', 'none');
    },
    
    callMaps: function(map) {
        app.setGooglePlusMarkers(map);
        app.setFacebookMarkers(map);
        app.setTwitterMarkers(map);
        app.setYoutubeMarkers(map);
        app.setFlickrMarkers(map);
    },
    
    loadMap: function() {
        var mapOptions = {
          zoom: 2,
          center: new google.maps.LatLng(13.923404, 2.812500),
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);
        app.callMaps(map);
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
	
    showDatepicker: function(element, network) {
         $("#"+element).prepend('</div>');
        $("#"+element).prepend('<p style="padding:15px"><button class="filterbtn" onclick="app.filter(\''+network+'\');"><i class="fa fa-play"></i> Filter</button>');
        $("#"+element).prepend('<div class="row"><div class="cell"><p style="padding:10px"><text style="text-transform:none">To</text></div><div class="cell"> <input id="to" type="text" class="datebox" /></p></div>');
        $("#"+element).prepend('<div class="row"><div class="cell"><p style="padding:10px"><text style="text-transform:none">From</text></div><div class="cell">  <input id="from" type="text" class="datebox" /></p></div>');
        $("#"+element).prepend('<div class="table">');
        var picker = $( "input[type='text']");
        picker.mobipick();
    },
    
	loadYoutube: function(fromm, too) {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        $("#youtube-content").html('');
        historical = false;
        if(fromm === undefined && too === undefined) {
            postdata = {required : 'display', eventname : currentEvent};
        } else {
            postdata = {required : 'display', eventname : currentEvent, datefrom: fromm, dateto: too};
            historical = true;
        }
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractyoutubedata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : postdata,
			dataType   : 'json',
			success    : function(response) {
                html = '';
                if(historical) {
                    html += '<p class="notice">Showing Youtube Videos from '+new XDate(fromm*1000).toString("dddd MMM d, yyyy HH:mm:ss")+' to '+new XDate(too*1000).toString("dddd MMM d, yyyy HH:mm:ss")+'</p>';
                }
				html += '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsonyoutubedata = response; //JSON.parse(response);
                if(response != null) {
                    var resultcount = jsonyoutubedata.results.length;
                    for (var i = 0; i < resultcount; i++) {
                        html += app.getYoutube(jsonyoutubedata.results[i]);
                    }
                    html += '</ul>	';
                } else {
                        html += '<li>No Videos</li>'
                }
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
							if(divider) {
							//html += '<a onclick="app.loadFacebookPosts(undefined,undefined,\''+gppost.actorid+'\')" data-rel="dialog" data-transition="slideup">Load user tweets\
									//</a></p>\
                                html += ' <div data-role="controlgroup" data-type="horizontal" >\
                                            <a onclick="app.setID('+gppost.actorid+');" href="#popupGoogle" data-rel="popup" data-role="button" data-icon="arrow-r" data-iconpos="right" >Analysis</a>\
                                          </div> ';
                            }
							html += '</li>';
							
		return html;
	},
	
    
	loadGooglePlus: function(fromm,too,useridorname) {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        var postdata = {};
        historical = false;
        var notcomplete = false;
        $("#google-content").html('');
        if (fromm === undefined && too === undefined) {
			if (useridorname === undefined) {
                // Normal POST for google plus posts
				postdata       =  {required : 'display', eventname : currentEvent};
			}
            else {
                app.prepareUserData("googleplus",useridorname);
                postdata       =  {required : 'uadisplay', eventname : useridorname, more: 0};
            }
        } else {
            postdata       = {required : 'display', eventname : currentEvent, from: fromm, to: too};
            historical = true;
        }
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractgoogleplusdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { if(!(notcomplete)) {  $.mobile.hidePageLoadingMsg(); }},
			data       : postdata,
			dataType   : 'json',
			success    : function(response) {	
                html = '';
                if(historical) {
                        html += '<p class="notice">Showing G+ posts from '+new XDate(fromm*1000).toString("dddd MMM d, yyyy HH:mm:ss")+' to '+new XDate(too*1000).toString("dddd MMM d, yyyy HH:mm:ss")+'</p>';
                }
				html += '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsongpdata = response; //JSON.parse(response);
                if(jsongpdata && jsongpdata.results != null) {
                    var resultcount = jsongpdata.results.length;
                    for (var i = 0; i < resultcount; i++) {
                        html += app.getGoogle(jsongpdata.results[i], true);
                    }
                    html += '</ul>	';
                    $("#google-content").html(html);
                    $.mobile.changePage("#googleplus");
                    $('.timeago').timeago();
                } else {
                    setTimeout(function() { app.loadGooglePlus(fromm,too,useridorname); },3000);
                    notcomplete = true;
                }
			},
			error      : function() {      
			}
		}); 
	},
	
    getFlickr: function(flickrphoto) {
		return '<div data-role="popup" id="popupFlickr'+flickrphoto.photo_id+'" data-overlay-theme="a" data-theme="d" data-corners="false">\
					<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a><img class="popphoto" src="http://farm'+flickrphoto.farm+'.staticflickr.com/'+flickrphoto.server+'/'+flickrphoto.photo_id+'_'+flickrphoto.secret+'_m.jpg" style="max-height:512px;" alt="Paris, France">\
				</div><a href="#popupFlickr'+flickrphoto.photo_id+'" data-rel="popup" data-position-to="window" data-transition="fade" class="ui-link"><img width="75" height="75" border="0" style="float:left" data-thumbdata="" class="pc_img" alt="'+flickrphoto.title+'" src="http://farm'+flickrphoto.farm+'.staticflickr.com/'+flickrphoto.server+'/'+flickrphoto.photo_id+'_'+flickrphoto.secret+'_s.jpg"></a>';
		html = '<div class="photo-display-item">'
        		+'<div class="thumb">'
            		+'<span class="photo_container pc_s">'
						+'<a href="#popupFlickr" data-rel="popup" data-position-to="window" data-transition="fade" class="ui-link">'
							+'<img width="75" height="75" border="0" data-thumbdata="" class="pc_img" alt="'+flickrphoto.title+'" src="http://farm'+flickrphoto.farm+'.staticflickr.com/'+flickrphoto.server+'/'+flickrphoto.photo_id+'_'+flickrphoto.secret+'_s.jpg">'
						+'</a>'
            		+'</span>'
        		+'</div>'
    		+'</div>';
		return html;
	},
    
	loadFlickr: function(fromm,too) {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        $("#flickr-content").html('');
        historical = false;
        postdata = {required : 'display', eventname : currentEvent};
        if(fromm === undefined && too === undefined) {
            postdata = {required : 'display', eventname : currentEvent};
        } else {
            postdata = {required : 'display', eventname : currentEvent, datefrom: fromm, dateto: too};
            historical = true;
        }
		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/extractflickrdata.php",
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : postdata,
			dataType   : 'json',
			success    : function(response) {
				html  = '';
                if(historical) {
                    html += '<p class="notice">Showing flickr photos from '+new XDate(fromm*1000).toString("dddd MMM d, yyyy HH:mm:ss")+' to '+new XDate(too*1000).toString("dddd MMM d, yyyy HH:mm:ss")+'</p>';
                }
				var jsonflickrdata = response;
                if(jsonflickrdata != null) {
                    var resultcount = jsonflickrdata.results.length;
                    for (var i = 0; i < resultcount; i++) {
                        html += app.getFlickr(jsonflickrdata.results[i]);
                    }
                } else {
                    html = '<li>No Results</li>';
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
                                html += ' <div data-role="controlgroup" data-type="horizontal" >\
                                            <a onclick="app.setID('+fbpost.from_id+');" href="#popupFacebook" data-rel="popup" data-role="button" data-icon="arrow-r" data-iconpos="right" >Analysis</a>\
                                          </div> ';
                            }
									html += '</li>'
							
		return html;
	},
	
	loadFacebookPosts: function(fromm,too,useridorname) {
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
        $("#facebook-content").html('');
        historical = false;
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
            postdata       = {required : 'display', eventname : currentEvent, datefrom: fromm, dateto: too};
            historical = true;
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
                html = '';
                if(historical) {
                        html += '<p class="notice">Showing facebook posts from '+new XDate(fromm*1000).toString("dddd MMM d, yyyy HH:mm:ss")+' to '+new XDate(too*1000).toString("dddd MMM d, yyyy HH:mm:ss")+'</p>';
                }
				html += '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search" >';
				var jsonfbdata = response;
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
	
    setID: function(id) {
        localStorage.setItem("ID",id);
    },
      
    refreshPage: function() {
        hash = window.location.hash;
        if(hash.indexOf("twitter") > 0) {
            app.loadTweets();
        }
        else if (hash.indexOf("facebook") > 0) {
            app.loadFacebookPosts();
        }
        else if (hash.indexOf("flickr") > 0) {
            app.loadFlickr();
        }
        else if (hash.indexOf("googleplus") > 0) {
            app.loadGooglePlus();
        }
        else if (hash.indexOf("youtube") > 0) {
            app.loadYoutube();
        }
        else if (hash.indexOf("last24") > 0) {
            app.loadSentiments(true);
        }
        else if (hash.indexOf("sentiment") > 0) {
            app.loadSentiments();
        }
        return;
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
                                            <a onclick="app.setID('+twittertweet.user_id+');" href="#popupBasic" data-rel="popup" data-role="button" data-icon="arrow-r" data-iconpos="right" >Analysis</a>\
                                          </div> ';
									
							}
                            html += '</li>';
		return html;
	},
	
	loadTweets: function(fromm,too,useridorname,page) {
        
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");
		var tweetCount = localStorage.getItem("tweetCount");
        
        if(page === undefined) {
            more = 0;
        } else {
            more = page;
        }
        if (more <= 0) {
            $("#twitter-content").html('');
        }
		tweetCount++;
        timeout = false;
		localStorage.setItem("tweetCount",tweetCount);
        historical = false;
		postdata = {};
		if (fromm === undefined && too === undefined) {
			if (useridorname === undefined) {
				postdata       = {required : 'display', eventname : currentEvent, more: more}
			}
			else {
						postdata       = {required : 'uadisplay', eventname : useridorname, more: more }
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
                                            
                                            if(more <= 0) {
								                html = '<ul class="twitter-content-listview" data-role="listview">';
                                            } else {
                                                html = $(".twitter-content-listview").html();
                                            }
                                            
											var jsontwitterdata = response;
                                            
											var resultcount = jsontwitterdata.results.length;
											for (var i = 0; i < resultcount; i++) {
												html += app.getTweet(jsontwitterdata.results[i],true);
											}
                                            if(more <= 0) {
											 html += '</ul>	';
                                            }
											if(more <= 0) {
								                $("#twitter-content").html(html);
                                            } else {
                                                $(".twitter-content-listview").html(html);
                                            }
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
			postdata       = {required : 'display', eventname : currentEvent, datefrom: fromm, dateto: too, more: more};
            historical = true;  
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
                    html = '';
                
                    if(historical) {
                        html += '<p class="notice">Showing tweets from '+new XDate(fromm*1000).toString("dddd MMM d, yyyy HH:mm:ss")+' to '+new XDate(too*1000).toString("dddd MMM d, yyyy HH:mm:ss")+'</p>';
                    }
					html += '<ul class="twitter-content-listview" data-role="listview" data-split-icon="search">';
                    if(more <= 0) {
                        html += '<ul class="twitter-content-listview" data-role="listview"  data-split-icon="search">';
                    } else {
                        html = $(".twitter-content-listview").html();
                    }
					var jsontwitterdata = response; //JSON.parse(response);
                    if (jsontwitterdata != null) {
                        var resultcount = jsontwitterdata.results.length;
                        for (var i = 0; i < resultcount; i++) {
                            html += app.getTweet(jsontwitterdata.results[i]);
                        }
                    } else {
                        html += '<li>No Tweets</li>'
                    }
                    html += '</ul>	';
                    if(more <= 0) {
					   $("#twitter-content").html(html);
                    } else {
                       $(".twitter-content-listview").html(html);
                    }
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
        $("#twitter-content").html('');
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
        $("#twitter-content").html('');
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
			currentTitleElement.innerHTML = '<i class="fa fa-'+currentTitleElement.id+'"></i> '+currentEvent;
		}
        $("#currentEvent").html(currentEvent);
        $.mobile.changePage("#page-home");
	},
	
    prepareUserData: function(network, id) {
        var PreCogURL = localStorage.getItem("PreCogURL");
        postdata       = {required : 'uadisplay', eventname : id, more: 0 };
        $.ajax({
            type       : "POST",
            url        : PreCogURL+"/functions/frontend/useranalysis/uacalldatascript.php",
            crossDomain: true,
            beforeSend : function() {$.mobile.showPageLoadingMsg();},
            complete   : function() {},
            data       : {network : network, useridorname : id},
            dataType   : 'json',
            success    : function() {},
            error      : function() {},
            async      : false
        });
    },
    
    
    
    drawUserChartSuccess: function(response,id,networkname,last24,prefix) {
        var obj  = response;
        userPoints = []
        if(obj && obj.results !== null) {
            localStorage.setItem('GraphMode','');
            count = obj.results.length;
            for (var i = 0; i < count; i++) {
                if(last24) {
                    userPoints.push([obj.results[i].hour, obj.results[i].count]);
                } else {
                    userPoints.push([obj.results[i].hour + ':00', obj.results[i].count]);
                }
            }
            console.log(userPoints);
            if(last24) {
                tickOptions = {formatString:'%#c', showGridline: false};
            }
            else {
                tickOptions = {formatString:'%a %b %e %H:%M', showGridline: false};
            }
            var axeslabel = 'Sentiment';
            var title = 'Sentiments';
            if (last24) {
                axeslabel = 'Number of Posts';
                title = 'Last 24 Hours';
            }
            var plot3 = $.jqplot(prefix+'chartdiv', [userPoints], 
            { 
              title: title, 
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
                       tickOptions:tickOptions,
                       autoscale: true

                   },
                   yaxis: {
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        label: axeslabel
                   }
               },
                legend: {
                    show: true,
                    fontSize: '12pt',
                    location: 's',     // compass direction, nw, n, ne, e, se, s, sw, w.
                    xoffset: 12,        // pixel offset of the legend box from the x (or x2) axis.
                    yoffset: 12,        // pixel offset of the legend box from the y (or y2) axis.
                    placement: 'outsideGrid',
                    renderer: $.jqplot.EnhancedLegendRenderer,
                    rendererOptions: {
                        numberRows: 1
                    }
                },
               series:[ 
                  {
                    label: networkname,
                    showLabel : true,
                    markerOptions: { style:'circle' }
                  }
              ]
            });
            $.mobile.hidePageLoadingMsg();
        }
        else {
            setTimeout(function(){ app.drawUserChart(id,networkname,last24); },3000);
        }
    },
    
    drawUserChart: function(id, networkname,last24) {
            postdata = {userid : id, networkname : networkname};
            
            var PreCogURL = localStorage.getItem("PreCogURL");
            loadurl =  PreCogURL+"/functions/frontend/uaextractsentimentdata.php"; 
            prefix = '';
            if(last24) {
                loadurl = PreCogURL+"/functions/frontend/uaextractgraphdata.php"; 
                prefix = 'last24';
            }
            $('#'+prefix+'chartdiv').html('');
            $.ajax({
                type       : "POST",
                url        : loadurl,
                crossDomain: true,
                beforeSend : function() {},
                complete   : function() {},
                data       : postdata,
                dataType   : 'json',
                timeout    : 10000,
                success    : function(response) {
                    app.drawUserChartSuccess(response,id,networkname,last24,prefix);
                    localStorage.setItem(prefix+"usersentiments_"+currentEvent,JSON.stringify(response));
			    },
                error      : function() {
                    response = localStorage.getItem(prefix+"usersentiments_"+currentEvent);
                    if(response.length > 0) {
                        app.drawUserChartSuccess(JSON.parse(response),last24,prefix);
                    }
                },
                async      : false
            });
    },
    
    
    loadSentimentsSucess: function(response, last24, prefix) {
        var obj  = response;
                
        if(obj && obj.results !== null) {
            
            var count = obj.results.GooglePlus.length;
            var post_array = [];
            var post_count = [];

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
            
              var axeslabel = 'Sentiment';
              var title = 'Sentiments';
              if (last24) {
                axeslabel = 'Number of Posts';
                title = 'Last 24 hours';
              }
              var plot3 = $.jqplot(prefix+'chartdiv', [gplusPoints, fbPoints, twitterPoints, youtubePoints, flickrPoints], 
                { 
                  title: title, 
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
                            label: axeslabel
                       }
                   },
                    legend: {
                        show: true,
                        fontSize: '12pt',
                        location: 's',     // compass direction, nw, n, ne, e, se, s, sw, w.
                        xoffset: 12,        // pixel offset of the legend box from the x (or x2) axis.
                        yoffset: 12,        // pixel offset of the legend box from the y (or y2) axis.
                        placement: 'outsideGrid',
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
    
	loadSentiments: function(last24) {
		oncethrough = 0;
		var PreCogURL = localStorage.getItem("PreCogURL");
		var currentEvent = localStorage.getItem("currentEvent");

        postdata = {eventname : currentEvent};
        
        var prefix = '';
        loadurl =  PreCogURL+"/functions/frontend/sentiment/extractsentimentdata.php";
        if(last24) {
            prefix = 'last24';
            loadurl = PreCogURL+"/functions/frontend/extractgraphdata.php";
        }
        $('#'+prefix+'chartdiv').html('');
        
        var graphMode = localStorage.getItem('GraphMode');
        
        if(graphMode != "") {
            var ID = localStorage.getItem("ID");
            app.prepareUserData(graphMode, ID);
            app.drawUserChart(ID,graphMode,last24);
            if(last24) {
                sentyTitle = document.getElementById("last24Title");
            } else {
                sentyTitle = document.getElementById("#sentimentTitle");
            }
            sentyTitle.innerHTML = "<i class='fa fa-"+graphMode.toLowerCase()+"'> "+graphMode;
            return;
        }
        else {
            if(last24) {
                sentyTitle = document.getElementById("last24Title");
                sentyTitle.innerHTML = "Last 24 hours - "+currentEvent;
            } else {
                        
                sentyTitle = document.getElementById("#sentimentTitle");
                sentyTitle.innerHTML = "Sentiments - "+currentEvent;
            }
        }
        
		$.ajax({
			type       : "POST",
			url        : loadurl,
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg(); },
			complete   : function() { $.mobile.hidePageLoadingMsg(); },
			data       : postdata,
			dataType   : 'json',
            timeout    : 10000,
			success    : function(response) {
				app.loadSentimentsSucess(response,last24,prefix);
                localStorage.setItem(prefix+"sentiments_"+currentEvent,JSON.stringify(response));
			},
			error      : function() {
                response = localStorage.getItem(prefix+"sentiments_"+currentEvent);
                if(response.length > 0) {
                    app.loadSentimentsSucess(JSON.parse(response),last24,prefix);
                }
            }
		}); 
	},
    
    geteventnamesSuccess: function(response) {
        var jsondata = response; 
        var html = '<ul data-filter="true" data-role="listview" id="main-panel-listview">';
        $.each(jsondata, function(i, v) {
            html += '<li class="clickable eventlistItems" onclick="app.changeevent(\''+v.eventname+'\')">'+v.eventname+'</li>';
        });
        html += '</ul>';
        $("#eventsPage-content").html(html);
        $("#currentEvent").html(currentEvent);
        $.mobile.changePage("#eventsPage");
    },
	
	geteventnames: function() {
		var PreCogURL = localStorage.getItem("PreCogURL");
        var currentEvent = localStorage.getItem("currentEvent");
        // PreCogURL = 'http://127.0.0.1/timeout.php';

		$.ajax({
			type       : "POST",
			url        : PreCogURL+"/functions/frontend/stats.php",
            // url         : PreCogURL,
			crossDomain: true,
			beforeSend : function() { $.mobile.showPageLoadingMsg();},
			complete   : function() { $.mobile.hidePageLoadingMsg();},
			data       : {functionname : 'geteventnames'},
			dataType   : 'json',
            timeout    : 10000, // 10 second timeout
			success    : function(response) {
                app.geteventnamesSuccess(response);
                localStorage.setItem("eventnames",JSON.stringify(response));
			},
			error      : function() { 
                response = localStorage.getItem("eventnames");
                if(response.length > 0) {
                    app.geteventnamesSuccess(JSON.parse(response));
                }
			}
		}); 
	}
	
};