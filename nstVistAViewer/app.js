/*
	VistA Patch Viewer
	Author: Nikolay Topalov

	Copyright 2014 Nikolay Topalov

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var application = {
	'labels' : {sDataDictionary : 'Data Dictionary',
				sPatchRequired: 'Required Patches',
				sPatchDescription: 'Description'},
				
	'session': {
				patch : {},
				rpc : '',
				rpcDUZ : '',
				rpcDivision : '',		// User division
				rpcContext : '',
				routineListLoaded  :  false,
				callingContainer : ''		// this is the panel that requested the new info panel
				}
};

EWD.application = {  
	name: 'nstVistAViewer',
	
	navFragments: {
	},
	
	onStartup:  function() {
		EWD.getFragment('patchSelection.html', 'patch_SelectionPane'); 
		EWD.getFragment('rpcSelection.html', 'rpc_SelectionPane');
		EWD.getFragment('ddSelection.html', 'dd_SelectionPane');
		EWD.getFragment('selectionPane.html', 'other_SelectionPane');

		EWD.getFragment('patchSummary.html', 'patch_SummaryPane'); 

		EWD.getFragment('ddData.html', 'ddData_Container');		
		EWD.getFragment('patchRoutineList.html', 'patchRoutineList_Container');		
		EWD.getFragment('routineDetail.html', 'routine_Container'); 	
		EWD.getFragment('rpcDetail.html', 'rpc_Container');
		EWD.getFragment('infoDetail.html', 'info_Container'); 		
		EWD.getFragment('rpcTesterForm.html', 'RPCTesterForm'); 
		
		// add listener to each navbar button
		$('#navList').children().each(function() { 
			$('#' + this.id).on('click', function() {
			appSwap(this.id);
			});
		});
		  
		 $('#navDropdownComponents').children().each(function() { 
			$('#' + this.id).on('click', function() {
			appSwap(this.id);
			});		  
        });
	},

	onPageSwap: {
	 },

	onFragment: {
		'patchSummary.html' : function(messageObj) {
			
			$('#PatchSummaryClose').click(function(e) { 
				application.session.routineListLoaded = false;

				showPane("patch_SelectionPane");
			});
			
			$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
				//e.target; // activated tab
				//e.relatedTarget; // previous tab
				hideInfoPanes();
				});
				
			$('#patchDescriptionLink').on('click',function(e) {
											displayPatchDescription($(this));
										});
			$('#patchRequiredLink').on('click',function(e) {
										displayPatchRequired($(this));
									});
		
		},

		'ddSelection.html' : function(messageObj) {
			$('#btnShowDDList').click(function(e) {	
					
					e.preventDefault();
					
					$(this).button('loading');
					
					hideInfoPanes();	// hide information panes
							
					EWD.sockets.sendMessage({
						type: "processDDSelection",
					params: {
						fileFrom : document.getElementById('ddFileFrom').value,
						fileTo : document.getElementById('ddFileTo').value,
						nameStart : document.getElementById('ddNameStart').value,
						nameContain : document.getElementById('ddNameContain').value,
						global : document.getElementById('ddGlobal').value
					}
					});
				});
		},
		
		'patchSelection.html' : function(messageObj) {
			$('#btnShowPatchList').click(function(e) {	
					
					e.preventDefault();
					
					$(this).button('loading');
					
					hideInfoPanes();	// hide information panes
							
					EWD.sockets.sendMessage({
						type: "processPatchSelection",
						params: {
							nameStart : document.getElementById('patchNameStart').value,
							nameContain : document.getElementById('patchNameContain').value
						}
					});
				});
		},
		
		'selectionPane.html' : function(messageObj) {
			$('#btnShowResultList').click(function(e) {	
					
					e.preventDefault();
					
					$(this).button('loading');
					
					
					hideInfoPanes();	// hide information panes
							
					EWD.sockets.sendMessage({
						type: "processSelection",
						params: {
							nameStart : document.getElementById('nameStart').value,
							nameContain : document.getElementById('nameContain').value,
							component : $(this).attr('data-search-for')
						}
					});
				});
		},
		
		'rpcSelection.html' : function(messageObj) {
		
			$('#btnShowRPCList').click(function(e) {	
				
				e.preventDefault();
				$(this).button('loading');
				hideInfoPanes();	// hide information panes
								
				EWD.sockets.sendMessage({
					type: "processRPCSelection",
					params: {
						ienFrom : document.getElementById('rpcIENFrom').value,
						ienTo : document.getElementById('rpcIENTo').value,
						nameStart : document.getElementById('rpcNameStart').value,
						nameContain : document.getElementById('rpcNameContain').value,
						routine : document.getElementById('rpcRoutine').value
					}
				});
			});
			
		},
		
		'rpcDetail.html' : function(messageObj) {
				
				// Shows modal RPC tester form
				$('#RPCDetailName').click(function(e) {
					var rpcParm;
					e.preventDefault();
					
					$('#RPCTesterFormTitle').text('RPC [' + application.session.rpc.name  + ']');
					
					$('#DUZ').val(application.session.rpcDUZ);
					$('#Division').val(application.session.rpcDivision);
					$('#RPCContextId').val(application.session.rpcContext);
					
					var inputParams = $('<div></div>').attr('id', 'RPCTesterParams');
							
					for (var i in application.session.rpc.inputParameters)  {
						rpcParm = application.session.rpc.inputParameters[i];
						var fieldId = 'RPCInput'+ i;
						if (rpcParm.type === undefined || rpcParm.type === 'REFERENCE' || rpcParm.type === 'LITERAL') {
							var param = $('<div></div>').
								attr('id','RPCInput'+ i + '-group').
								addClass('form-group');
							
							var lbl = $('<label></label>').
								attr('for', fieldId).
								text(rpcParm.name);
								
							var inputField = $('<input></input>').
											addClass('form-control').
											attr('id', fieldId).
											attr('name', fieldId).
											attr('type', 'text').
											attr('maxlength',rpcParm.maximumLength).
											attr('data-toggle','popover').	
											attr('data-content', rpcParm.description).		
											text(rpcParm.name);

							param.append(lbl).append(inputField);
						} else if (rpcParm.type === 'LIST') {
							var param = $('<div></div>')
										.attr('id', fieldId + '-group')
										.attr('name', fieldId + '-group')
										.addClass('form-group');
												
							param.append( $('<label></label>')
										.attr('for', fieldId + '-list')
										.text(rpcParm.name));
										
							param.append(' ').append($('<button type="button" />')			// Add item button
										.attr('data-field-id', fieldId)
										.attr('data-content-parent', rpcParm.description)
										.attr('onClick','onAddRPCInputListItem($(this))')
										.addClass('btn btn-default')
										.addClass('item-add')						
										.text('Add item'));
										
															
							param.append( $('<ul></ul>')
										.addClass('list-group')
										.attr('id', fieldId + '-list')
										.attr('data-id-counter', 0)); 								
						} else if (rpcParm.type === 'WORD PROCESSING') {
							var param = $('<div></div>').
								attr('id','RPCInput'+ i + '-group').
								addClass('form-group');
							
							var lbl = $('<label></label>').
								attr('for', fieldId).
								text(rpcParm.name);
								
							var inputField = $('<textarea></textarea>').
											addClass('form-control').
											attr('id', fieldId).
											attr('name', fieldId).
											attr('rows', 3).
											attr('maxlength',rpcParm.maximumLength).
											attr('data-toggle','popover').	
											attr('data-content', rpcParm.description);

							param.append(lbl).append(inputField);						
						};
							
						inputParams.append(param);

					}; 
					
					$('#RPCTesterParams').replaceWith(inputParams);
					$('[data-toggle="popover"]').popover({trigger: 'focus','placement': 'auto'});		// initialize pop-over
					document.getElementById('RPCTesterResult').innerHTML = '';
					
					$('#RPCTesterForm').modal('show');
		
					});	
			},
			
		'routineDetail.html' : function(messageObj) {
			
			$('#RoutineDetailClose').click(function(e) { 
				
				if (application.session.callingContainer.length > 0) {
					
					showPane(application.session.callingContainer);
					application.session.callingContainer = '';
					
				} else {
					$('#routine_Container').hide();
				};
			});
		
		},
			 
		'rpcTesterForm.html' : function(messageObj) {
		
			$('#RPCExecuteBtn').click(function(e) {
					// save DUZ and context
					application.session.rpcDUZ = $('#DUZ').val();
					application.session.rpcDivision = $('#Division').val();
					application.session.rpcContext =  $('#RPCContextId').val();
					
					var rpc = {"name": application.session.rpc.name,
								"duz": application.session.rpcDUZ, 
								"division": application.session.rpcDivision, 
								"context": application.session.rpcContext, 
								"input": []
								};
					var rpcInputParam;
					
					e.preventDefault();

					var inputValue = $('#RPCTester').serializeArray();
					
					for (var i in application.session.rpc.inputParameters) { 
						rpcInputParam = application.session.rpc.inputParameters[i];
						rpc.input[i] = {};
						rpc.input[i].type = rpcInputParam.type;

						if (rpcInputParam.type === 'LIST') {

							var itemSubscript;
							var itemValue;
							var itemSubscriptObject;
							
							var listItems = $( '#RPCInput' + i + '-list').children();
							rpc.input[i].value = [];
							var sub = {};
							var scriptsArray;
							for (var index = 0; index < listItems.length; ++index) {				
								itemSubscript = $('#' + listItems[index].id + '-item-subscript').val();
								itemValue = $('#' + listItems[index].id + '-item-value').val();
																
								rpc.input[i].value[index] = {"subscripts": itemSubscript.split(','), "data" : itemValue};
							}
						} else if (rpcInputParam.type === 'WORD PROCESSING') {
							rpc.input[i].value = $('#RPCInput' + i).val().split('\n');
						} else {
							rpc.input[i].value = $('#RPCInput' + i).val();
						};
					};
						
					EWD.sockets.sendMessage({
						type: "executeRPC",
						params: rpc
						});
										
				});
			}
		
		},
		   
	onMessage: {
		'processDDSelection': function(messageObj) {	// process selected DDs and create a list
			var files = messageObj.message;
			var link;
			var delimiter = ""; // new line or comma
			var html =$('<div></div>');
			for (var file in files) {			
									
				html.append(delimiter);
				link = $('<a></a>')
						.addClass('btn-link')
						.attr('data-file',files[file].file)
						.attr('data-action',"definition")
						.text(files[file].file + ' ' + files[file].name);
						
				html.append(link).append('<a  class="btn-link" data-action="data" data-file="' + files[file].file + '">'
										+ ' <span class="glyphicon glyphicon-list"></span>'
										+ '</a>');
										
				delimiter = "<br>";
			};

			$('#btnShowDDList').button('reset');
			$('#ddList').html(html);
			
			$('#ddList a[data-action="data"]').click(function (e) {
									displayDDData($(this));
								});
			
			$('#ddList a[data-action="definition"]').click(function (e) {
									displayDDDefinition($(this));
								});
		},
		
		'processRPCSelection': function(messageObj) {	// process selected RPCs and create a list
			var rpcs = messageObj.message.rpcs;
			var component = messageObj.message.component;
			
			if (document.getElementById('rpcAlphaSort').checked) {
				rpcs = rpcs.sort(function(a, b){
								return a.name > b.name;
								});
			};
			
			var delimiter = ""; // new line or comma
			var singleLine =  document.getElementById('rpcSingleLine').checked;
			var displayIEN =  document.getElementById('rpcShowIEN').checked;
			var text;
			var html =$('<div></div>');
			for (var rpc in rpcs) {			
				
				text = displayIEN ? rpcs[rpc].ien + ' ' : '';
				text += rpcs[rpc].name;
				
				html.append(delimiter);
				html.append($('<a></a>')
						.addClass('btn-link')
						.attr('data-component-file',component.file)
						.attr('data-component-name',component.name)
						.attr('data-ien',rpcs[rpc].ien)
						.text(text));
			
				delimiter = (singleLine) ? ", " : "<br>";
			};

			$('#btnShowRPCList').button('reset');
			$('#rpcList').html(html);
			
			$('#rpcList a').click(function (e) {
									displayPatchComponentDetails($(this));
								});
		},
		
		'processSelection': function(messageObj) {	// process selected items and create a list
			var items = messageObj.message.items;
			var component = messageObj.message.component;
			
			var delimiter = "";
			var text;
			var html =$('<div></div>');
			for (var item in items) {			
				
				text = items[item].name;
				
				html.append(delimiter);
				html.append($('<a></a>')
						.addClass('btn-link')
						.attr('data-ien',items[item].ien)
						.attr('data-component-file',component.file)
						.attr('data-component-name',component.name)
						.text(items[item].name));
			
				delimiter = "<br>";
			};
			
			$('#btnShowResultList').button('reset');
			$('#selectionResultList').html(html);
			
			$('#selectionResultList a').click(function (e) {
										displayPatchComponentDetails($(this));
									});
		},
		
		'processPatchSelection': function(messageObj) {	// process selected patches and create a list
			var patches = messageObj.message;
			
			var delimiter = "";
			var text;
			var html =$('<div></div>');
			
			for (var patch in patches) {			
				
				text = patches[patch].name;
				
				html.append(delimiter);
				html.append($('<a></a>')
						.addClass('btn-link')
						/* .attr('data-patch-ien',patches[patch].ien) */
						.attr('data-patch-name',patches[patch].name)
						.text(patches[patch].name));
			
				delimiter = "<br>";
			};
			
			$('#btnShowPatchList').button('reset');
			$('#patchList').html(html);
			
			$('#patchList a').click(function (e) {
										displayPatchSummary($(this));
									});
		},
		
		'displayPatchSummary' : function(messageObj) {		// display patch details
			// render the patch Summary
			var patchComponents = messageObj.params.components;
			var patch =  messageObj.params.patch;
			
			application.session.patch.ien = patch.ien;
			application.session.patch.description = patch.description;
			
			var delimiter = "";
			var itemId;
			var aLink;
			var html =$('<div></div>');
			
			for (var index in patchComponents) {			
				
				itemId = 'patchComponentItem' + index;
				
				html.append(delimiter);
				aLink = $('<a></a>')
						.addClass('btn-link')
						.attr('id',itemId)
						.attr('data-patch-ien',patch.ien)
						.attr('data-component-file',patchComponents[index].file)
						.attr('data-component-name',patchComponents[index].name)
						.text(patchComponents[index].name);
						
				aLink.append($('<span></span>')
						.addClass('badge')
						.text(patchComponents[index].counter));
				
				html.append(aLink);
			
				delimiter = "<br>";
			};   
			
			
			$('#patchComponents').html(html);
			// attach click event
			$('#patchComponents a').click(function (e) {
									displayPatchComponentList($(this));
								});
			
			document.getElementById('PatchSummaryName').innerHTML = patch.name;
			
			showPane('patch_SummaryPane');
			
			// render Data Dictionary Tab
			
			aLink = $('<a></a>')
				.addClass('btn-link')
				.attr('id','patchComponentItemDD')
				.attr('data-patch-ien',patch.ien)
				.attr('data-component-file',patch.dd.file)
				.attr('data-component-name',patch.dd.name)
				.text('Data Dictionary');
						
			aLink.append($('<span></span>')
					.addClass('badge')
					.text(patch.dd.counter > 0 ? patch.dd.counter : ''));
						
			html = $('<div></div>').append(aLink);		
			
			$('#patchDDs').html(html);
			// attach click event
			$('#patchDDs a').click(function (e) {
									displayPatchDDList($(this));
								});
								
			// Render General Patch Tab			
			$('#patchDescriptionLink').attr('data-patch-ien',patch.ien);
			$('#patchDescriptionLink').text(application.labels.sPatchDescription);
			
			$('#patchRequiredLink').attr('data-patch-ien',patch.ien);
			document.getElementById('patchRequiredLink').innerHTML = application.labels.sPatchRequired + '<span class="badge">'+ patch.requiredCounter + '</span>';
			
			$('#patchDateDistributed').text(patch.dateDistributed);
			$('#patchPeInstallRoutine').text(patch.preInstallRoutine);
			$('#patchPostInstallRoutine').text(patch.postInstallRoutine);
			$('#patchEnvironmentCheckRoutine').text(patch.environmentCheckRoutine);
			$('#patchPreTransportationRoutine').text(patch.preTransportationRoutine);
					
			
		},
		
		'displayPatchComponentList': function(messageObj) {	// display patch component list
			var component =  messageObj.params.component;			
			var list = messageObj.params.list;
			
			var delimiter = '';
			var html =$('<div></div>');
			
			for (var index in list) {			
				html.append(delimiter);
				html.append($('<a></a>')
						.addClass('btn-link')
						.attr('data-ien',list[index].ien)
						.attr('data-component-file',component.file)
						.attr('data-component-name',component.name)
						.text(list[index].name));
			
				delimiter =  "<br>";
			};
			
			$('#patchComponentListBody').html(html);
			
			$('#patchComponentListBody a').click( function (e) { displayPatchComponentDetails($(this)); } );
			
			showPane('patchComponentList');
		},
		
		'displayPatchDDList': function(messageObj) {	// display patch component list			
			var list = messageObj.params.list;
			var patchIEN = messageObj.params.patchIEN;
			
			var delimiter = '';
			var text;
			var html =$('<div></div>');
			
			for (var index in list) {			
				text = list[index].fullFile ? '()' : '(P)';
				text += ' ' + formatFileName(list[index].fileNumber, list[index].fileName) ;
				
				html.append(delimiter);
				html.append($('<a></a>')
						.addClass('btn-link')
						.attr('data-file-number',list[index].fileNumber)
						.attr('data-patch-ien',patchIEN)
						.text(text));
			
				delimiter =  "<br>";
			};
			
			$('#patchDDListBody').html(html);
			
			$('#patchDDListBody a').click( function (e) { 
										displayPatchDDDetails($(this));
									});
			
			showPane('patchDDList');
		},
		
		'displayPatchComponentDetails' : function (messageObj) { // display patch component details
			var component = renderPatchComponentDetails(messageObj.params);
			
			document.getElementById('InfoDetailName').innerHTML = component.name;
			document.getElementById('InfoDetailContent').innerHTML = component.rendered;	
			showPane('info_Container');
		},
		
		'displayPatchDDDetails'	 : function (messageObj) {
			var pPatchDDDetails = messageObj.params.ddDetails;
			var pFileName = messageObj.params.fileName;
			var pFileNumber = messageObj.params.file;
			
			$('#InfoDetailName').text(formatFileName(pFileNumber, pFileName));
			$('#InfoDetailContent').html(dispJSON(pPatchDDDetails));
			
			showPane('info_Container');
		},
		
		'displayPatchRequired' : function (messageObj) {							
				var patchInfo = messageObj.params;
				
				$('#InfoDetailName').text(application.labels.sPatchRequired);
				$('#InfoDetailContent').html(renderPatchRequired(patchInfo));
				$('#InfoDetailContent a').click(function (e) {
										displayPatchSummary($(this));
									});
				showPane('info_Container');				
		},
		
		'displayRPCDetails' : function (messageObj) {			
				// format the RPC detail html
				application.session.rpc = messageObj.params;
				document.getElementById('RPCDetailName').innerHTML = application.session.rpc.name;
				document.getElementById('RPCDetailContent').innerHTML = renderRPCDetails(application.session.rpc, 'rpc_Container');	
				$('#RPCDetailContent a').click(function (e) {
									displayRoutine(e, $(this));
								});
				showPane('rpc_Container');
		},
		
		'displayPatchRoutineList' : function (messageObj) {	
			if (!application.session.routineListLoaded) {
				var routineList = messageObj.params.patchRoutineList;
				$('#patchRoutineListName').text('Routines');
			
				var aaData=[];				
				for (var i in routineList) {
					aaData.push(
								[
									i,
									'<a class="btn-link" data-link="routine"'
										+ ' data-routine-name="' + routineList[i].name + '"'
										+ ' data-routine-tag=""'
										+ ' data-calling-container="patchRoutineList_Container">'
										+ routineList[i].name + '</a>',
									routineList[i].checksum,
									routineList[i].comments,
									routineList[i].patches,
									routineList[i].datetimeUpdated
								]
								);
				}	

				var ddDataListDT=$('#patchRoutineListTable').dataTable({
						'bDestroy':true,
						'aaData': aaData,
						'aoColumns': [
							{'bVisible':false},{'sTitle':'Name'},{'sTitle':'Checksum'},{'sTitle':'Description'},{'sTitle':'Patches'},{'sTitle':'Updated', 'sType' : 'date'}
						],
						        "oTableTools": {
            "aButtons": [
                {
                    "sExtends":    "text",
                    "sButtonText": "Hello world"
                }
            ]
        }
					}).css('width','');
				
				application.session.routineListLoaded = true;
			};
			
			$('#patchRoutineListTable tbody').on("click", 'tr a[data-link="routine"]',
						function (e) { 			
							displayRoutine(e, $(this));
						} );
			
			showPane('patchRoutineList_Container');
		},
		
		'displayRoutine' : function(messageObj) {	// process and display a routine
				// format the routine detail html			
				var routine = messageObj.params;
				var text = htmlEscape(routine.routine.join('\n'));
				if (routine.routineTag.length > 0) {	// set routine tag link
					var searchTag = '\n' + routine.routineTag + '(';				
					text = text.replace(searchTag, '<a name = "'+routine.routineTag+'">' + searchTag +'</a>');
				}
				document.getElementById('RoutineDetailName').innerHTML = routine.routineName;
				document.getElementById('RoutineDetailContent').innerHTML = "<pre>" + text + "</pre>";
				showPane('routine_Container');
				if (routine.routineTag.length > 0) { 
					window.location.hash = routine.routineTag;	// jump to the routine tag
				}; 
		},
		
		'displayExecuteRPCResult' : function(messageObj) {		// process the RPC result
			var result = messageObj.params;
			var str;
			if (!result.success) {
				str = 'Error : ' + result.message;
			} else {
				if (result.result.type === "ARRAY" || result.result.type === "GLOBAL ARRAY" || result.result.type === "WORD PROCESSING" ) {
					str = JSON.stringify(result.result.value, null, '\t')
				}
				else {
					str = result.result.value;
				};
			};
			document.getElementById("RPCTesterResult").innerHTML = '<pre>' + str + '</pre>';
		},
	
		'displayDDDefinition' : function(messageObj) {
			var pFile = messageObj.params.file;
			var pFileName = messageObj.params.fileName;
			
			var detail = messageObj.params.detail;
			
			$('#InfoDetailName').text(formatFileName(pFile, pFileName));
			$('#InfoDetailContent').html(dispJSON(detail));	
			showPane('info_Container');
		},
	
		'displayDDData' : function(messageObj) {
			return; // TODO
			var pFields = messageObj.params.fields;
			var pFile = messageObj.params.file;
			var pFileName = messageObj.params.fileName;
			
			$('#ddDataFileName').text(formatFileName(pFile, pFileName));
			
			var aoColumns = [ {'sTitle': 'IEN' } ];
			var aaData = [];
			
			for (var i in pFields) {
				aoColumns.push( { 'sTitle' : pFields[i].name + '(#' + i + ')' } );
			}
			console.log("aoColumns --> ",JSON.stringify(aoColumns));
			/* ddDataListDT=$('#ddDataListTable').dataTable();
			ddDataListDT.fnDestroy(); */
			
			var ddDataListDT=$('#ddDataListTable').dataTable({
					'bDestroy':true,
					'aaData': aaData,
					'aoColumns': aoColumns
				}).css('width','');
			showPane('ddData_Container');	
		}
	}
 };

 var formatFileName = function (pFile, pFileName) {
	return pFileName + ' file (#' + pFile + ')'
 };
 
EWD.onSocketsReady = function() {

  EWD.application.framework = 'bootstrap';
  if (EWD.application.onStartup) EWD.application.onStartup();

};

EWD.onSocketMessage = function(messageObj) {

  if (EWD.application.onMessage) {
    if (EWD.application.onMessage[messageObj.type]) EWD.application.onMessage[messageObj.type](messageObj);
  } 

  if (EWD.application.messageHandlers) EWD.application.messageHandlers(messageObj);

};

var resetSelectionPane = function (target) {
	var paneHeading;
	
	if (target === 'securityKey') {	
		paneHeading = 'Select Security Key';
	} else if (target === 'parameterDefinition') {
		paneHeading = 'Select Parameter Definition';
	} else if (target === 'option') {
		paneHeading = 'Select Option';
	} else if (target === 'routine') {
		paneHeading = 'Select Routine';
	};
	
	$('#selectionPaneHeading').html('<h3 class="panel-title">' + paneHeading + '</h3>')
	$('#btnShowResultList').attr('data-search-for', target);
	$('#selectionResultList').html($('<div></div>'));
	$('#nameStart').val('');
	$('#nameContain').val('');
};

var appSwap = function(targetId) {
	var target = targetId.split('_')[0];
	var targetPane;
	
	if (target === 'securityKey' || target === 'parameterDefinition' || target === 'option'  || target === 'routine') {
		resetSelectionPane(target);
		targetPane = "other_SelectionPane";
	} else {
		targetPane = target + "_SelectionPane";
	};
	
	showPane(targetPane);
};

var displayPatchSummary = function(obj) {
	/* 	var ien = obj.attr('data-patch-ien'); */
		var name = obj.attr('data-patch-name');
		
		EWD.sockets.sendMessage({
			type: "getPatchSummary",
			params: {
/* 				patchIEN : ien, */
				patchName : name
			}
		});
		
	};

var displayPatchComponentList = function (obj) {
	var component = { 'file' : obj.attr('data-component-file'), 'name': obj.attr('data-component-name')};
	var patchIEN = obj.attr('data-patch-ien');
	$('#patchComponentListTitle').text(component.name);
	
	hideInfoPanes();	// hide information panes
	
	var messageType = (component.name === 'ROUTINE') ? 'getPatchRoutineList' : 'getPatchComponentList';
	EWD.sockets.sendMessage({
		type: messageType,
		params: {				
			patchIEN : patchIEN,
			component : component
		}
	});
};

var displayPatchDDList = function (obj) {
	var patchIEN = obj.attr('data-patch-ien');
	$('#patchDDListTitle').text(application.labels.sDataDictionary);
	
	hideInfoPanes();	// hide information panes
	
	EWD.sockets.sendMessage({
		type: "getPatchDDList",
		params: {				
			patchIEN : patchIEN
		}
	});
};

var displayPatchDescription = function (obj) {
	hideInfoPanes();	// hide information panes

	$('#InfoDetailName').text(application.labels.sPatchDescription);
	document.getElementById('InfoDetailContent').innerHTML = renderPatchDescription(application.session.patch);
	showPane('info_Container');
};

var displayPatchRequired = function (obj) {
	var patchIEN = obj.attr('data-patch-ien');
	
	hideInfoPanes();	// hide information panes
	
	EWD.sockets.sendMessage({
		type: "getPatchRequired",
		params: {				
			patchIEN : patchIEN
		}
	});
};

var displayPatchComponentDetails = function(obj) {
	var component = { 'file' : obj.attr('data-component-file'), 'name' : obj.attr('data-component-name')}; 
	var ien = obj.attr('data-ien');
	var name = obj.text();
	application.session.callingContainer = '';
	
	EWD.sockets.sendMessage({
		type: "getPatchComponentDetails",
		params: {				
			ien : ien,
			name : name, 
			component : component
		}
	});
};

var displayPatchDDDetails = function (obj) {
	var patchIEN = obj.attr('data-patch-ien');
	var file = obj.attr('data-file-number');
	
	EWD.sockets.sendMessage({
		type: "getPatchDDDetails",
		params: {				
			patchIEN : patchIEN,
			file : file
		}
	});
};

var displayDDDefinition = function(obj) {
	var file = obj.attr('data-file');

	EWD.sockets.sendMessage({
		type: "getDDDefinition",
		params: {				
			file : file
		}
	});
	
	return;
};

var displayDDData = function(obj) {
	var file = obj.attr('data-file');
	
	hideInfoPanes();
	
	EWD.sockets.sendMessage({
		type: "getDDData",
		params: {				
			file : file
		}
	});
};

var displayRoutine = function(e, obj) {
	e.preventDefault();
	e.stopPropagation();

	var callingContainer = obj.attr('data-calling-container');
	application.session.callingContainer = callingContainer;

	var routine = obj.attr('data-routine-name');
	var tag = obj.attr('data-routine-tag');
	
	EWD.sockets.sendMessage({
		type: "getRoutine",
		params: {
			routineName : routine,
			routineTag : tag
		}
	});
		
	};

// swap panes			
var showPane = function(name) {		
	
	switch (name)
	{
	case 'patch_SelectionPane':
		hideAllPanes();
		break;
	case 'rpc_SelectionPane':
		hideAllPanes();	
		break;
	case 'dd_SelectionPane':
		hideAllPanes();	
		break;
	case 'other_SelectionPane':
		hideAllPanes();
		break;
	case 'patch_SummaryPane':
		$('#patch_SelectionPane').hide();
		$('#patchComponentList').hide();
		$('#patchDDList').hide();
		$('#info_Container').hide();
		break;
	case 'rpc_Container':
		$('#routine_Container').hide();
		$('#patchRoutineList_Container').hide();
		break;
	case 'patchRoutineList_Container' :
		$('#routine_Container').hide();
	case 'routine_Container':
		$('#'+application.session.callingContainer).hide();
		break;
	}; 
	
	$('#' + name).show();
};

var hideAllPanes = function() {
	$('#other_SelectionPane').hide();
	$('#patch_SelectionPane').hide();
	$('#patch_SummaryPane').hide();
	$('#patchRoutineList_Container').hide();
	$('#rpc_SelectionPane').hide();
	$('#rpc_Container').hide();
	$('#routine_Container').hide();
	$('#dd_SelectionPane').hide();
	$('#ddData_Container').hide();
	$('#info_Container').hide();
};

var hideInfoPanes = function() {
	$('#info_Container').hide();
	$('#rpc_Container').hide();
	$('#routine_Container').hide();
	$('#patchComponentList').hide();
	$('#patchRoutineList_Container').hide();
	$('#ddData_Container').hide();
};

var onAddRPCInputListItem = function (obj) {
	var fieldId = obj.attr('data-field-id');
	var dataContentParent = obj.attr('data-content-parent');
	
	var newSubscript = $('#'+fieldId+'-subscript').val();		// new subscript to add
	
	var param = $('#'+fieldId+'-list');		// the ID of the RPC input parameter 
	var lastItemNumber = param.attr('data-id-counter');
	
	param.attr('data-id-counter',++lastItemNumber);	//increase counter of items
	
	var newRow = renderRPCInputListItem(fieldId + '-item' + lastItemNumber, dataContentParent);	// create a new row item

	param.append(newRow);
	$('[data-toggle="popover"]').popover({trigger: 'focus','placement': 'auto'});		// initialize pop-over
	$('[data-toggle="tooltip"]').tooltip({'placement': 'auto'});
}

var onDeleteRPCInputListItem = function (btn) {
	var fieldId = btn.attr('data-id');
	$('#' + fieldId).remove();
};

var renderRPCInputListItem = function (fieldId, dataContentParent) {
  
	var newRow = $('<div></div>')
				.addClass('row')
				.attr('id', fieldId);
	
	var inputSubscript = $('<div></div>')
					.addClass('col-xs-5')
					.append($('<input></input>')
							.addClass('form-control')
							.attr('id', fieldId + '-item-subscript')
							.attr('name', fieldId + '-item-subscript')
							.attr('type', 'text')
							.attr('placeholder','Enter subscript')
							.attr('data-toggle','popover')	
							.attr('data-content',dataContentParent));
							
	var inputValue = $('<div></div>')
					.addClass('col-xs-5')
					.append($('<input></input>')
							.addClass('form-control')
							.attr('id', fieldId + '-item-value')
							.attr('name', fieldId + '-item-value')
							.attr('type', 'text')
							.attr('placeholder','Enter value')
							.attr('data-toggle','popover')	
							.attr('data-content',dataContentParent));							
	
	var btnDel = $('<button></button>')
							.addClass('btn btn-danger')
							.attr('data-id', fieldId)
							.attr('data-toggle','tooltip')
							.attr('data-original-title','Delete item')
							.attr('type', 'button')
							.attr('onClick','onDeleteRPCInputListItem($(this))')							
							.append($('<span></span>').addClass('glyphicon glyphicon-remove'));
							
	var inputDel = $('<div></div>')
					.addClass('col-xs-1')
					.append(btnDel);						
		
	newRow.append(inputSubscript).append(inputValue).append(inputDel);
		
	return newRow;
};	
	
// return formatted HTML RPC details
var renderRPCDetails = function(rpc, callingContainer) {
			
	var text = '';
	var x;

	text += "<table class='table table-bordered ' cellspacing=0 width=100%>";
		
	// --- RPC characteristics
	text += "<tr class='info'>";
	text += "<th >Tag</th>";
	text += "<th >Routine</th>";
	text += "<th >Availability</th>";
	text += "<th >Status</th>";
	text += "<th >Client Manager</th>";
	text += "<th >Version</th>";
	text += "</tr>";
	
	text += '<td>' + '<a class="btn-link"'
				   + ' data-routine-name="' + rpc.routine + '"'
				   + ' data-routine-tag="' + rpc.tag + '"' 
				   + ' data-calling-container="' + callingContainer + '">'
				   + rpc.tag + '</a>' +  '</td>';
	text += "<td >" + rpc.routine + "</td>"; 
	text += "<td>" + trimValue(rpc.availability) + "</td>";   
	text += "<td>" + trimValue(rpc.inactive) + "</td>";		
	text += "<td>" + trimValue(rpc.clientManager) + "</td>"; 
	text += "<td>" + trimValue(rpc.version) + "</td>";
		
	// --- RPC Description
	text +=  "<tr class='info'><th colspan=6>Description</th></tr>";
	text +=  "<tr><td  colspan=6>";
	text += "<pre>";
	text += (rpc.description.length > 0) ? htmlEscape(rpc.description) : "&nbsp;";
	text += "</pre>";
	text += "</td></tr>";

	// --- Parameter descriptions
	text += "<tr class='info'>";
	text += "<th class='info'>Input Parameter</th>"
	text += "<th>Sequence</th>";
	text += "<th>Type</th><th>Maximum Length</th>"
	text += "<th colspan=2>Required</th>";
	text += "</tr>";
	
	for (i in rpc.inputParameters)  {
		x = rpc.inputParameters[i];
		text += "<tr>";
		text += "<td rowspan=2>" + trimValue(x.name) + "</td>"
		text += "<td>" + trimValue(x.sequence) + "</td>";
		text += "<td>" + trimValue(x.type) + "</td>";
		text += "<td>" + trimValue(x.maximumLength) + "</td>";
		text += "<td colspan=2>" + trimValue(x.required) + "</td>";
		text += "</tr>"; 		
		text += "<tr><td  colspan=5>";
		text += "<pre>";
		text +=  (x.description.length > 0) ? htmlEscape(x.description) : "&nbsp;";
		text += "</pre>";
		text += "</td></tr>";
	};
	
	if (rpc.inputParameters.length === 0) {
		text += "<tr><td colspan=6> N/A </td></tr>";
	}

	// --- Result characteristics
	text += "<tr class='info'>";
	text += "<th >Return Parameter</th>";
	text += "<th>Word Wrap</th><th colspan=4>&nbsp;";
	text += "</th></tr>";
	
	text += "<tr>";
	text += "<td >" + rpc.returnValueType + "</td>";
	text += "<td>" + rpc.wordWrapOn + "</td>";
	text += "<td colspan=5>&nbsp;</td>";
	text += "</tr>";
	
	// --- Result description
	text += "<tr class='info'><th colspan=6>Description</th></tr>";
	text += "<tr><td  colspan=6>";
	text += "<pre>";
	text +=  (rpc.returnValueDescription.length > 0) ? htmlEscape(rpc.returnValueDescription) : "&nbsp;";
	text += "</pre>";
	text += "</td></tr>";

	text += "</table>"; 
		
	return text;
	};

var renderPatchComponentDetails = function (component) {

	var text;

	switch (component.component.name)
	{
	case "DIALOG":
		text = renderPatchDialog(component.detail[component.component.file][component.ien + ',']);
		break;
	case "OPTION":
		text = renderPatchOption(component.detail[component.component.file][component.ien + ',']);
		break;	
	case "PARAMETER DEFINITION":
		text = renderPatchParameterDefinition(component);
		break;	
	case "SECURITY KEY":
		text = renderPatchSecurityKey(component.detail[component.component.file][component.ien + ',']);
		break;
	default :
		
		text = dispJSON(component.detail);
		/* text += "<table class='table table-bordered ' cellspacing=0 width=100%>";
		text += JSON.stringify(component); // TODO
		text += "</table>"; */
		break;
	}
	return {'rendered': text, 'name': component.name};
}	

var renderPatchDescription = function (patchInfo) {
	var text = 	'<pre>' + patchInfo.description + '</pre>';
	return text;
};

var renderPatchRequired = function (patchInfo) {
			
	var delimiter = '';
	var text;
	var html =$('<div></div>');
	
	for (var index in patchInfo) {			
		text = patchInfo[index].name;
		
		html.append(delimiter);
		html.append($('<a></a>')
				.addClass('btn-link')
				.attr('data-patch-name',patchInfo[index].name)
				.text(text));
	
		delimiter =  "<br>";
	};
	
	return html;
};

// render Kernel Security Key  - SECURITY KEY file (#19.1)
var renderPatchSecurityKey = function(component){
	var name = component['NAME']['E'];
	var text = "<table class='table table-bordered ' cellspacing=0 width=100%>";
  
	//--- Security Key characteristics
	text += "<tr class='info'>";
	text += "<th>Descriptive Name</th>";
	text += "</tr>";
	
	text += "<tr>";
	text += "<td>" + component['DESCRIPTIVE NAME']['E'] + "</td>";
	text += "</tr>";
	
	// --- Security Key Description
	text += "<tr class='info'><th>Description</th></tr>";
	text += "<tr><td>";
	text += "<pre>";
	var tmp = wordProcessingArray(component['DESCRIPTION'])
	text += (tmp.length > 0) ? htmlEscape(tmp) : "&nbsp;";
	text += "</pre>";
	text += "</td></tr>";
	text += "</table>";
	
	return text;
};

// render Kernel Dialog  - DIALOG file (#.84)
var renderPatchDialog = function(component){

	var text = "<table class='table table-bordered ' cellspacing=0 width=100%>";
  
	//--- Dialog Definition characteristics
	text += "<tr class='info'>";
	text += "<th>Dialog Number</th>";
	text += "<th>Type</th>";
	text += "<th>Internal Parameters Needed</th>";
	text += "<th>Package</th>";
	text += "<th>Short Description</th>";
	text += "</tr>";

	
	text += "<tr>";
	text += "<td  width='20%'>" + component['DIALOG NUMBER']['E'] + "</td>";
	text += "<td  width='20%'>" + component['TYPE']['E'] + "</td>";
	text += "<td  width='20%'>" + component['INTERNAL PARAMETERS NEEDED']['E'] + "</td>";
	text += "<td  width='20%'>" + component['PACKAGE']['E'] + "</td>";
	text += "<td  width='20%'>" + component['SHORT DESCRIPTION']['E'] + "</td>";
	text += "</tr>";
	
	// --- Dialog Definition Description
	text += "<tr class='info'><th colspan=5>Text</th></tr>";
	text += "<tr><td colspan=5>";
	text += "<pre>";
	var tmp = wordProcessingArray(component['TEXT'])
	text += (tmp.length > 0) ? htmlEscape(tmp) : "&nbsp;";
	text += "</pre>";
	text += "</td></tr>";
	text += "</table>";
	
	return text;
};

// render Kernel Option  - OPTION file (#19)
var renderPatchOption = function(component){

	var text = "<table class='table table-bordered ' cellspacing=0 width=100%>";
  
	//--- Dialog Definition characteristics
	text += "<tr class='info'>";
	text += "<th>Menu Text</th>";
	text += "<th>Type</th>";
	text += "<th>Routine</th>";
	text += "<th>Package</th>";
	text += "<th>Security key</th>";
	text += "</tr>";

	
	text += "<tr>";
	text += "<td  width='20%'>" + component['MENU TEXT']['E'] + "</td>";
	text += "<td  width='20%'>" + component['TYPE']['E'] + "</td>";
	text += "<td  width='20%'>" + component['ROUTINE']['E'] + "</td>";
	text += "<td  width='20%'>" + component['PACKAGE']['E'] + "</td>";
	text += "<td  width='20%'>" + component['LOCK']['E'] + "</td>";
	text += "</tr>";
	
	// --- Dialog Definition Description
	text += "<tr class='info'><th colspan=5>Description</th></tr>";
	text += "<tr><td colspan=5>";
	text += "<pre>";
	var tmp = wordProcessingArray(component['DESCRIPTION'])
	text += (tmp.length > 0) ? htmlEscape(tmp) : "&nbsp;";
	text += "</pre>";
	text += "</td></tr>";
	text += "</table>";
	
	return text;
};


// render Kernel component Parameters - PARAMETERS file (#8989.5)
var renderPatchParameterDefinition = function(pComponent) {
	var item = pComponent.detail[pComponent.component.file][pComponent.ien + ',']
	
	var text = "<table class='table table-bordered ' cellspacing=0 width=100%>";

	//--- Parameter Definition characteristics
	text +="<tr class='info'>";
	text +="<th>Dispalay Text</th>";
	text += "<th>Value Data Type</th>";
	text += "<th>Help</th>";
	text += "</tr>";

	text += "<tr>";
	text += "<td>" + item['DISPLAY TEXT']['E'] + "</td>";
	text += "<td>" + item['VALUE DATA TYPE']['E'] + "</td>";
	text += "<td>" + item['VALUE HELP']['E'] + "</td>";
	text += "</tr>";

	text += "<tr class='info'>";
	text += "<th colspan=5>Precedence : Entity</th>";
	text += "</tr>";

	var tmpDecsription = wordProcessingArray(item['DESCRIPTION'])
	
	var entities = '';
	var del ='';
	for (var i in pComponent.detail['8989.513']) {		// get entities
		item = pComponent.detail['8989.513'][i];
		entities += del + item['PRECEDENCE']['E'] + ' : ' + item['ENTITY FILE']['E'];
		del = ' | ';
	};
	
	text += "<tr>";
	text += "<td colspan=5 align=left>" + entities + "</td>";			 	 //; entities
	text += "</tr>";
	
	// --- Parameter Definition Description
	text += "<tr class='info'><th colspan=5>Description</th></tr>";
	text += "<tr><td class='Descr' colspan=5>";
	text += "<pre>";
	text += (tmpDecsription.length > 0) ? htmlEscape(tmpDecsription) : "&nbsp;";
	text += "</pre>";
	text += "</td></tr>";
	text += "</table>";

	return text;
};
		
var trimValue = function(str) {
		var x;
		
		if (typeof str === 'undefined') str = "";
		
		x = str.trim();
		
		return (x === "") ? "&nbsp;" : x ;
	}; 
	
var htmlEscape = function(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
};

// returns word-processing field value
// root is the array with the WP field value
var wordProcessingArray = function(root) {

		var result = "";
		var line;
		for (line in root) {
			if (line > 0) result += root[line] + '\n';
		}
				
		return result;	
	};

	// from Chris Casey code - take any Vista table format JSON object and make it a table
	// TODO 
var dispJSON = function(jobj,debug) {
	//debug = true;
	var jtext='<table class="table table-condensed table-striped "><tbody>';
	var del='<tr><td>',dela='</td></tr>',deli='</td><td>' ;
	var inTable=false
	function jsDebug(p,x) {console.log(p+':'+x)};
	function jsInside(jobj) {
		for (var i in jobj) {
			if (debug) jsDebug(1,i+' '+typeof jobj[i]);
			if (typeof jobj[i] == 'object') {
				if (inTable) {
					if (debug) jsDebug(4,typeof i);
					if ((i>0)) {
						if (debug) jsDebug(5,i)
					}
					else {
						//jtext=jtext+'</tbody></table></tr>';
						inTable=false;
					}
				}
				if (jobj[i].E !==undefined) {
					if (debug) jsDebug(2,i);
					if (jobj[i][1] !=undefined) {
						jtext=jtext+del+i+deli;
						var space='';
						for (var cl=1;(jobj[i][cl]);cl++) {
							jtext=jtext+space+jobj[i][cl];
							space=' ';
							};
						jtext=jtext+dela;
						continue;					
					};
					jtext=jtext+del+i+deli+jobj[i].E+dela;
					continue;
				}
				if (debug) EWD.loop=jobj[i];
				if (jobj[i] instanceof Array) {
					 //jtext=jtext+'<tr><table class="table table-condensed"><th>'+i+'</th><tbody>'
					 inTable=true;
					if (debug) {
					 jsDebug(3,i+' is array');
					 }
				}
				jsInside(jobj[i]);
				}
			else {
				jtext=jtext+del+i+deli+jobj[i]+dela;
				};
		}
	};
	jsInside(jobj);
	return jtext+'</tbody></table>';
};