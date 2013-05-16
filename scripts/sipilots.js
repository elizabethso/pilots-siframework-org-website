            dojo.addOnLoad(function () {
            	// Redefining console to disable logging, comment out if you need to log
            	// redefining the entire console object for IE safety
            	//  - Date redefined as it is only used for logging
            	var console = { log: function () {} }, Date = function () { return { getTime: function () {} } };
            	
            	var pane;
            	
            	if (moveMarkers) {
            		function reportLocation(e) {
            			pane.containerNode.innerHTML = "";
            			
            			dojo.query("div.marker").forEach(function (node) {
            				var title;
            				if (dojo.hasClass(node, "new")) {
            					title = node.className.split(" ")[2];
            				} else {
            					var ids = getIDs(node);
            					if (ids.initiative) {
            						var initiativeObj = json.initiatives[ids.initiative],
        					    	    pilotObj = initiativeObj.pilots[ids.pilot - 1],
        					    	    participantObj = json.companies[pilotObj.participants[ids.participant - 1]];
            						title = participantObj.title;
            					} else {
            						var participantGroupObj = json.participantGroups[ids.participantGroup];
            						title = participantGroupObj.title;
            					}
            				}
            				
            				var div = document.createElement("div");
            				div.style.display = "block";
            				div.style.marginBottom = "5px";
            				var sp = document.createElement("span");
            				sp.innerHTML = title + "<br> x: " + node.style.left + ", y: " + node.style.top;
            				if (e && e.target.parentNode.parentNode == node) {
            					sp.style.fontWeight = "bold";
            				}
            				div.appendChild(sp);
            				
            				pane.containerNode.appendChild(div);
            			});
            			if (e) dojo.stopEvent(e);
            		}
            		
            		function addMarker() {
            			var i = 1;
            			
            			dojo.query("div.marker.new").forEach(function (node) {
            				i += 1;
            			});
            			
            			var tmp = new widgets.MapMarker({ "properties": { "className": "marker new added-test-marker-" + i } }).domNode;
            			tmp.style.top = "5px";
            			tmp.style.left = "5px";
            			tmp.style.position = "absolute";
            			
            			dojo.place(tmp, dojo.query(".map")[0]);
            			new dojo.dnd.Moveable(tmp);
            			dojo.connect(tmp, 'onclick', reportLocation);
            		}
            		
            		var div = document.createElement("div");
            		pane = new dijit.TitlePane({ title: "Markers" });
            		div.appendChild(pane.domNode);
            		div.style.width = "200px";
            		div.style.top = "5px";
            		div.style.left = "5px";
            		div.style.position = "absolute";
            		dojo.dnd.Moveable(div);
            		document.body.appendChild(div);
            		
            		new dijit.form.Button({ "label": "Add test marker",
            			                    "onClick": addMarker }).placeAt(pane.focusNode);
            	}
            	
            	var json = {},
            	    nodeBalloonAssoc = { "initiatives": {}, "participantGroups": {} },
            	    associations;
            	
            	console.log("0: " + (new Date()).getTime());
            	
            	dojo.xhrGet({
            		url: "initiatives.json",
            		preventCache: true,
            		load: initiativesHandler
            	});
            	
            	/* Handle json response and render map functionality
            	 *
            	 * params
            	 * data - response from the server after requesting initiatives.json
            	 */
            	function initiativesHandler(data) {
            		console.log("1: " + (new Date()).getTime());
            		
            		json = dojo.fromJson(data);
            		
            		console.log("2: " + (new Date()).getTime());
            		
            		dojo.place(new widgets.MapCounts({ "properties": calcMapCounts(json) }).domNode, "mapcounts");
            		
            		console.log("3: " + (new Date()).getTime());
            		
            		renderReset();
            		for (var initiative in json.initiatives) {
            			renderSelectors(json.initiatives[initiative], initiative);
            			console.log("4: " + (new Date()).getTime());
            			renderMarkers(json.initiatives[initiative], initiative);
            			console.log("5: " + (new Date()).getTime());
                    }
            		
            		console.log("6: " + (new Date()).getTime());
            		
            		// position markers & attach balloon popups to each marker placed on the map
            		dojo.query("div.marker").forEach(function (node) {
        				dojo.forEach(dojo.query("img", node), function (img) {
        					var ids = getIDs(node);
        					
        					console.log("7: " + (new Date()).getTime());
        					
        					if (ids.initiative) {
        						var initiativeObj = json.initiatives[ids.initiative],
        					    	pilotObj = initiativeObj.pilots[ids.pilot - 1],
        					    	participantObj = json.companies[pilotObj.participants[ids.participant - 1]];
        						
            					// position marker
            					node.style.top = participantObj.y + "px";
            					node.style.left = participantObj.x + "px";
            					
            					// attach balloon popup
            					if (!nodeBalloonAssoc.initiatives[ids.initiative]) nodeBalloonAssoc.initiatives[ids.initiative] = [];
            					if (!nodeBalloonAssoc.initiatives[ids.initiative][ids.pilot - 1]) nodeBalloonAssoc.initiatives[ids.initiative][ids.pilot - 1] = [];
            					
            					if (moveMarkers) {
            	            		dojo.connect(node, 'onclick', reportLocation);
            					} else {
	            					nodeBalloonAssoc.initiatives[ids.initiative][ids.pilot - 1][ids.participant - 1] = new HelpBalloon({
	            						icon: img,
	            						title: participantObj.title,
	            						content: constructPopupContent(initiativeObj, pilotObj, participantObj)
	            					});
            					}
        					} else {
        						var participantGroupObj = json.participantGroups[ids.participantGroup];
        						
        						// position marker
        						node.style.top = participantGroupObj.y + "px";
        						node.style.left = participantGroupObj.x + "px";
        						
        						// attach balloon popup
        						if (moveMarkers) {
        		            		dojo.connect(node, 'onclick', reportLocation);
        						} else {
	        						nodeBalloonAssoc.participantGroups[ids.participantGroup] = new HelpBalloon({
	            						icon: img,
	            						title: participantGroupObj.title,
	            						content: constructMultiPopupContent(json.initiatives, ids.participantGroup)
	            					});
        						}
        					}
        				});
            		});
                    
            		console.log("8: " + (new Date()).getTime());
            		
            		associations = getAssociations(json.initiatives, json.participantGroups);
            		if (moveMarkers) reportLocation();
            		
            		console.log("9: " + (new Date()).getTime());
            		
            		/* Calculate the number of initiatives, pilots & participants
            		 *
            		 * params
            		 * initiatives - json.initiatives
            		 */
            		function calcMapCounts(json) {
            			var numInitiatives = 0,
            			    numPilots = 0,
            			    numParticipants = 0;
            			
            			for (var initiative in json.initiatives) {
            				numInitiatives += 1;
            				numPilots += json.initiatives[initiative].pilots.length;
            			}
            			
            			for (var company in json.companies) {
            				if (!json.companies[company].excludeFromCount) {
            					numParticipants += 1;
            				}
            			}
            			
            			return { "numInitiatives": numInitiatives, "numPilots": numPilots, "numParticipants": numParticipants };
            		}
            		
            		/* Construct HTML for display in balloon popup
            		 *
            		 * params
            		 * initiative - json.initiatives[..initiative..]
            		 * pilot - json.initiatives[..initiative..].pilots[..pilot..]
            		 * participant - json.initiatives[..initiative..].pilots[..pilot..].participants[..participant..]
            		 */
            		function constructPopupContent(initiative, pilot, participant) {
            			var properties = { "initiativeLabel": initiative.title,
            				               "pilotLabel": pilot.title,
            				               "pilotDescription": pilot.description,
            				               "pilotPageUrl": pilot.pageUrl,
            				               "companyUrlScheme": participant.companyUrlScheme,
            			                   "companyUrl": participant.companyUrl },
            			    node = new widgets.PopupContent({ "properties": properties }).domNode,
            			    container = document.createElement("div");
            			
            			container.appendChild(node);
            			
            			return container.innerHTML;
            		}
            		
            		/*
            		 * 
            		 */
            		function constructMultiPopupContent(initiatives, participantGroup) {
            			var participants = {},
            			    html,
            			    container = document.createElement("div"),
            			    node = document.createElement("p"),
            			    tmp = document.createElement("div");
            			
            			tmp.className = "participantinfo";
            			tmp.appendChild(node);
            			container.appendChild(tmp);
            			
            			for (var initiative in initiatives) {
            				dojo.forEach(initiatives[initiative].pilots, function (pilot) {
            					dojo.forEach(pilot.participants, function (participant) {
            						tmp = json.companies[participant];
            						if (tmp.groupId == participantGroup) {
				     			        if (participants[tmp.title]) {
				     			        	participants[tmp.title].pilots.push({ "pilotLabel": pilot.title,
	                                                                              "pilotPageUrl": pilot.pageUrl });
				     			        } else {
				     			        	participants[tmp.title] = { "pilots": [ { "pilotLabel": pilot.title,
				     			        		                                      "pilotPageUrl": pilot.pageUrl } ],
				     			        		                        "companyName": tmp.title,
				     			        			                    "companyUrlScheme": tmp.companyUrlScheme,
			     			                                            "companyUrl": tmp.companyUrl };
				     			        }
            						}
            					});
            				});
            			}
            			
            			for (var participant in participants) {
            				tmp = participants[participant];
            				dojo.forEach(tmp.pilots, function (pilot, i) {
	            				var properties = { "pilotLabel": pilot.pilotLabel,
	            					               "pilotPageUrl": pilot.pilotPageUrl };
	            				
	            				if (i == 0) {
	            					properties.companyName = tmp.companyName;
	            					properties.companyUrlScheme = tmp.companyUrlScheme;
	            					properties.companyUrl = tmp.companyUrl;
	            					
	            				    node.appendChild(new widgets.MultiPopupContent({ "properties": properties }).domNode);
	            				} else {
	            					tmp = node.childNodes[node.childNodes.length-1];
	            				    tmp.childNodes[tmp.childNodes.length-1].appendChild(new widgets.ExtraPilot({ "properties": properties }).domNode);
	            				}
            				});
            			}
            			
     			        return container.innerHTML;
            		}
            		
            		/*
            		 * 
            		 */
            		function renderReset() {
            			var properties = { "id": "reset_selectors",
            				               "title": "Reset Selection" };
            			dojo.place(new widgets.ResetSelectors({ "properties": properties }).domNode, dojo.byId("accordion"));
            			
            			dojo.connect(dojo.byId(properties.id), "onclick", function (e) {
                    		dojo.query("input[type=checkbox]", dojo.byId("accordion")).forEach(function (node) {
                    			dijit.getEnclosingWidget(node).set("checked", dojo.hasClass(node.parentNode, "all"));
                    		});
            				
            				updateMap();
            				
            				dojo.stopEvent(e);
            			});
            		}
            		
	                /* Render the checkboxes to hide and show the markers on the map
	               	 *
	               	 * params
	               	 * initiative - json.initiatives[..initiative..]
	               	 * name - initiative acronym e.g. lri, toc, pd
	               	 */
	               	function renderSelectors(initiative, name) {
                        var tp = new dijit.TitlePane({ title: initiative.title, open: initiative.open });
                        dojo.byId("accordion").appendChild(tp.domNode);
                        
                        var cb = new dijit.form.CheckBox({ "onClick": clickHandler,
                        	                               "class": name + " all",
                        	                               "id": name + "-all",
                        	                               "checked": true }).placeAt(tp.containerNode);
                        tp.containerNode.appendChild(createLabel(initiative["view all title"], name + "-all"));
                        
                        dojo.forEach(initiative.pilots, function (pilot, i) {
                       		new dijit.form.CheckBox({ "onClick": clickHandler,
                       			                      "class": name,
                       			                      "id": name + "-" + (i + 1) }).placeAt(tp.containerNode);
                       		tp.containerNode.appendChild(createLabel(pilot.title, name + "-" + (i + 1)));
                        });
                        
                        tp.startup();
                        
                        /*
                         * FIXME: Hack since I couldn't figure out any way for dojo to generate label with checkbox 
                         */
                        function createLabel(text, id) {
                            var sp = document.createElement("span");
                            sp.style.paddingLeft = "5px";
                            sp.innerHTML = text;
                            var lb = document.createElement("label");
                            lb.htmlFor = id;
                            lb.appendChild(sp);
                            lb.appendChild(document.createElement("br"));
                            return lb;
                        }
	               	}
	               	
	               	/* Render the markers on the map
	               	 *
	               	 * params
	               	 * initiative - json.initiatives[..initiative..]
	               	 * name - initiative acronym e.g. lri, toc, pd
	               	 */
	               	function renderMarkers(initiative, name) {
	               		dojo.forEach(initiative.pilots, function (pilot, i) {
	               			dojo.forEach(pilot.participants, function (participant, j) {
	               				var properties = {},
	               				    tmp = json.companies[participant];
	               				
	               				if (tmp.groupId) {
	               					if (dojo.query("." + tmp.groupId + ".marker.participantgroup").length == 0) {
	               						properties.className = tmp.groupId + " marker participantgroup";
	               					}
	               				} else {
	               				    properties.className = name + " marker group-" + (i + 1) + " marker-" + (i + 1) + "-" + (j + 1);
	               				}
	               				
	               				if (properties.className) {
	               					tmp = new widgets.MapMarker({ "properties": properties }).domNode;
	               					dojo.place(tmp, dojo.query(".map")[0]);
	               					if (moveMarkers) new dojo.dnd.Moveable(tmp);
	               				}
	               			});
	               		});
	               	}
	               	
	           		/*
	           		 * 
	           		 */
	           		function getAssociations(initiatives, participantGroups) {
	           			var associations = { "pilotMarkerAssoc": {},
	           					             "markerPilotAssoc": {} };
	           			
	           			for (var participantGroup in participantGroups) {
	           				var markerSelector = "." + participantGroup + ".marker.participantgroup";
	   						
	   						associations.markerPilotAssoc[markerSelector] = { "pilots": [],
	                                                                          "balloon": nodeBalloonAssoc.participantGroups[participantGroup] };
	           			}
	           			
	           			for (var initiative in initiatives) {
	           				dojo.forEach(initiatives[initiative].pilots, function (pilot, i) {
	           					associations.pilotMarkerAssoc[pilot.title] = { "markers": [] };
	           					dojo.forEach(pilot.participants, function (participant, j) {
	           						var markerSelector;
	           						if (json.companies[participant].groupId) {
	           							markerSelector = "." + json.companies[participant].groupId + ".marker.participantgroup";
	           							if (associations.pilotMarkerAssoc[pilot.title].markers.indexOf(markerSelector) == -1) {
	           								associations.pilotMarkerAssoc[pilot.title].markers.push(markerSelector);
	           							}
	           							if (associations.markerPilotAssoc[markerSelector].pilots.indexOf(pilot.title) == -1) {
	           								associations.markerPilotAssoc[markerSelector].pilots.push(pilot.title);
	           							}
	           						} else {
	           							markerSelector = "." + initiative + ".marker.group-" + (i + 1) + ".marker-" + (i + 1) + "-" + (j + 1);
	           							associations.pilotMarkerAssoc[pilot.title].markers.push(markerSelector);
	           							associations.markerPilotAssoc[markerSelector] = { "pilots": [ pilot.title ],
	   	                                                                                  "balloon": nodeBalloonAssoc.initiatives[initiative][i][j] };
	           						}
	           					});
	           				});
	           			}
	           			
	           			return associations;
	           		}
            	}
            	
                /* Given a map marker div return the initiative acronym, pilot id & participant id. Ids being the numbers set in the divs class name list.
                 *
                 * params
                 * node - div surrounding individual markers on map
                 */
	       		function getIDs(node) {
	       			var names = node.className.split(" "),
	       			    result = {};
	       			
	       			dojo.forEach(names, function (entry) {
	   					if (entry.indexOf("marker-") == 0) {
	   						result.pilot = entry.split("-")[1];
	   						result.participant = entry.split("-")[2];
	   					} else if (entry != "marker" && entry != "participantgroup" && node.className.indexOf("participantgroup") > -1) {
	   						result.participantGroup = entry;
	   					} else if (entry.indexOf("marker") == -1 && entry.indexOf("group") == -1) {
	   						result.initiative = entry;
	   					}
	       			});
	       			
	       			// will be one of the following
	       			// - { "initiative": ..., "pilot": ..., "participant": ... }
	       			// - { "participantGroup": ... }
	       			return result;
	       		}
            	
            	/* Handle the hiding and showing of markers on the map
            	 *
            	 * Functionality:
            	 * - checking the box of a particular pilot needs to uncheck every view all checkbox
            	 * - checking the box of a view all needs to only check that individual checkbox
            	 * - unchecking any box, particular pilot or view all, needs to only uncheck that individual checkbox
            	 *
            	 * params
            	 * e - event object
            	 */
            	function clickHandler(e) {
            		var target = e.target,
            		    parent = target.parentNode,
            		    uncheckAlls = target.checked && !dojo.hasClass(parent, "all"),
            		    uncheckInitiativesPilots = target.checked && dojo.hasClass(parent, "all");
            		
            		if (uncheckAlls) {
    					dojo.query("div.all input[type=checkbox]", dojo.byId("accordion")).forEach(function (node) {
    						dijit.getEnclosingWidget(node).set("checked", false);
    					});
    				} else if (uncheckInitiativesPilots) {
    					dojo.query("div:not(.all) input[type=checkbox]", parent.parentNode).forEach(function (node) {
    						dijit.getEnclosingWidget(node).set("checked", false);
    					});
    				}
            		
            		updateMap();
            	}
            	
            	function updateMap() {
            		dojo.query("input[type=checkbox]", dojo.byId("accordion")).forEach(function (node) {
            			var div = node.parentNode,
            			    initiative = node.id.split("-")[0];
            			
            			if (dojo.hasClass(div, "all")) {
            				dojo.forEach(json.initiatives[initiative].pilots, function (pilot) {
            					associations.pilotMarkerAssoc[pilot.title].allChecked = dijit.getEnclosingWidget(node).get("checked");
            				});
            			} else {
            				var i = (node.id.split("-")[1] - 1);
            				
            				associations.pilotMarkerAssoc[json.initiatives[initiative].pilots[i].title].pilotChecked = dijit.getEnclosingWidget(node).get("checked");
            			}
            		});
            		
            		for (var marker in associations.markerPilotAssoc) {
            			var visible = false;
            			dojo.forEach(associations.markerPilotAssoc[marker].pilots, function (pilot, i) {
        					if (associations.pilotMarkerAssoc[pilot].allChecked || associations.pilotMarkerAssoc[pilot].pilotChecked) {
        						visible = true;
        					}
            			});
            			if (visible) {
            				dojo.query(marker)[0].style.display = "block";
            			} else {
            				dojo.query(marker)[0].style.display = "none";
            				if (!moveMarkers) associations.markerPilotAssoc[marker].balloon.hide();
            			}
            		}
            	}
            });
