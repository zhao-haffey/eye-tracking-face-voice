/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten/Cat release (2019-2021) author: Dr. Anthony Haffey (team@someopen.solutions)
*/
function check_trialtypes_in_proc(procedure,post_trialtype){
	var experiment 		= $("#experiment_list").val();
	var this_exp   		= master_json.exp_mgmt.experiments[experiment];
	var this_proc  		= this_exp.all_procs[procedure];
	var trialtypes 		= [];
	var trial_type_col  = this_proc[0].map(function(element){
		if(element !== null){
			return element.toLowerCase();
		}
	}).indexOf(post_trialtype);
	for(var i in this_proc){
		if(i > 0) {
			if(this_proc[i][trial_type_col] !== null){
				trialtypes.push(this_proc[i][trial_type_col].toLowerCase());
			}
		}
	}
	trialtypes = trialtypes.filter(n => n);
	console.dir(trialtypes);
	if(typeof(master_json.exp_mgmt.experiments[experiment].trialtypes) == "undefined"){
		master_json.exp_mgmt.experiments[experiment].trialtypes = {};
	}
	trialtypes.forEach(function(trialtype){
		if(typeof(master_json.trialtypes.user_trialtypes[trialtype]) !== "undefined"){
			master_json.exp_mgmt.experiments[experiment].trialtypes[trialtype] = master_json.trialtypes.user_trialtypes[trialtype];
		} else if(typeof(master_json.trialtypes.default_trialtypes[trialtype]) !== "undefined"){
			master_json.exp_mgmt.experiments[experiment].trialtypes[trialtype] = master_json.trialtypes.default_trialtypes[trialtype];
		} else {
			Collector.custom_alert("Invalid trialtype <b>"+trialtype+"</b> in at least one of your procedure sheets. The file will save, but the experiment won't run until you use a valid trialtype.",4000);
		}
	});
}
function clean_conditions(){
  exp_json = master_json.exp_mgmt.experiments[$("#experiment_list").val()];

  var parsed_conditions = Collector.PapaParsed(exp_json.conditions);
  parsed_conditions = parsed_conditions.filter(row => row.procedure !== "");
  parsed_conditions = parsed_conditions.map(function(row){
    row.name = row.name.replaceAll(" ","_");
    /*
    if(row.name.indexOf(" ") !== -1){
      bootbox.alert("You have a space in your condition: " + row.name + ". Please change the name to not have any spaces");
    }
    */
    return row;
  });

  exp_json.conditions = Papa.unparse(parsed_conditions);

  update_handsontables();
}
function createExpEditorHoT(sheet,selected_handsonTable, sheet_name) {
	if (selected_handsonTable.toLowerCase() == "conditions") {
		var area = $("#conditionsArea");
		var table_name = 'handsOnTable_Conditions';
	} else if (selected_handsonTable.toLowerCase() == "stimuli") {
		var area = $("#stimsArea");
		var table_name = 'handsOnTable_Stimuli';
	} else if (selected_handsonTable.toLowerCase() == "procedure") {
		var area = $("#procsArea");
		var table_name = 'handsOnTable_Procedure';
	} else {
		bootstrap.alert("There is a bug in your code - not clear which experiment sheet you want to edit/update/create etc.");
	}
	area.html("<span class='sheet_name' style='display: none'>" + sheet_name + "</span>");
	var container = $("<div>").appendTo(area)[0];
  window[table_name] = createHoT(
    container,
    Papa.parse(sheet).data,
    sheet_name
  );
}
function get_HoT_data(current_sheet) { // needs to be adjusted for
    console.dir(current_sheet);
    var data = JSON.parse(JSON.stringify(current_sheet.getData()));

    // remove last column and last row
    data.pop();

    for (var i=0; i<data.length; ++i) {
        data[i].pop();

        for (var j=0; j<data[i].length; ++j) {
            if (data[i][j] === null) {
                data[i][j] = '';
            }
        }
    }

    // check for unique headers
    var unique_headers = [];

    for (var i=0; i<data[0].length; ++i) {
        while (unique_headers.indexOf(data[0][i]) > -1) {
            data[0][i] += '*';
        }

        unique_headers.push(data[0][i]);
    }

    return data;
}
function list_studies(){
  try{
    name_list = Object.keys(master_json.exp_mgmt.experiments);
    function update_exp_list(){
      var series_select_html = "<select id='add_study_pathway_select'  class='custom-select'><option hidden disabled selected>Select a study</option>";
      var select_html = "<select id='experiment_list'  class='custom-select'><option hidden disabled selected>Select a study</option>";
      name_list.sort(function(a,b){
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      name_list.forEach(function(item_name){
        series_select_html += "<option>" + item_name + "</option>";
        select_html += "<option>" + item_name + "</option>";
      });
      series_select_html += "</select>";
      select_html += "</select>";

      //$("#add_study_pathway_select").val()
      $("#add_study_pathway_select_div").html(series_select_html);

      $("#experiments").html(select_html);
      $("#experiment_list").on("change",function(){
        if(typeof(first_load) == "undefined" ||
				   first_load	== false){
           $("#save_btn").click();
        } else {
          remove_from_list("Select a dropbox experiment");
          first_load = false;
        }

        exp_json = master_json.exp_mgmt.experiments[this.value];
        clean_conditions();
        $("#dropbox_inputs").show();
        update_handsontables();
        update_server_table();
        $("#save_btn").click();

      });
    }
    //do longer synch with dropbox if the user is using dropbox
    if(dropbox_check()){
      dbx.filesListFolder({path:"/experiments"})
          .then(function(experiments){
            experiments.entries.forEach(function(entry){
              if(entry[".tag"] == "file" && entry.name.indexOf(".json") !== -1 ){
                var entry_name = entry.name.toLowerCase().replace(".json","");
                //do not write over master_json for now if there is an experiment json with the same name
                if(name_list.indexOf(entry_name) == -1){
                  name_list.push(entry_name);
                  synch_experiment(entry_name);
                }
              }
            });
            update_exp_list();
          })
          .catch(function(error){
            Collector.tests.report_error("problem listing the experiments", "problem listing the experiments");
          });
    } else { //just a sanity check that the user is in fact using a localhost version
      switch(Collector.detect_context()){
        case "localhost":
          update_exp_list()
          break;
      }
    }
    Collector.tests.pass("studies",
                         "list");
  } catch(error){
    Collector.tests.fail("studies",
                         "list",
                         error);
  }
}
function new_experiment(experiment){
  if($("#experiment_list").text().indexOf(experiment) !== -1){
		bootbox.alert("Name already exists. Please try again.");
	} else {

    //create it first in dropbox, THEN update table with location
		master_json.exp_mgmt.experiments[experiment] = JSON.parse(
      JSON.stringify(default_experiment)
    );

		var this_path = "/Experiments/" + experiment + ".json";

    function update_experiment_list(experiment){
			$('#experiment_list').append($('<option>', {
        text : experiment
      }));
      $("#experiment_list").val(experiment);
      update_handsontables();
      update_master_json();
			$("#save_btn").click();
    }
		if(dropbox_check()){
      dbx_obj.new_upload({path:this_path,contents:JSON.stringify(default_experiment)},function(result){
        dbx.sharingCreateSharedLink({path:this_path})
          .then(function(returned_link){
            switch(Collector.detect_context()){
              case "server":
							case "gitpod":
							case "github":
								update_experiment_list(experiment);
								break;
            }
          })
          .catch(function(error){
            Collector.tests.report_error("new_experiment trying to share link","new_experiment trying to share link");
          });
      },function(error){
        Collector.tests.report_error("new_experiment trying to upload template to dropbox","new_experiment trying to upload template to dropbox");
      },
      "filesUpload");

    } else {

			update_experiment_list(experiment);
    }
	}

}
function remove_from_list(experiment){
	var x = document.getElementById("experiment_list");
	x.remove(experiment);
	if(experiment !== "Select a dropbox experiment"){
		update_handsontables();
	}
}
function renderItems() {
  // Highlight to users which accounts they are logged in with
  ////////////////////////////////////////////////////////////
  highlight_account("dropbox_account_email");
  highlight_account("collector_account_email");

  first_load = true;

  list_studies();
	list_mods();
  list_surveys();
	list_trialtypes();
	list_graphics();
  list_servers();
	initiate_actions();
  autoload_mods();
}
function stim_proc_defaults(proc_values,stim_values){
	var this_exp   = master_json.exp_mgmt.experiments[$("#experiment_list").val()];

	// selecting Stimuli_1 and Procedure_1 as default
	if(proc_values.indexOf("Procedure_1") !== -1){
		$('#proc_select').val("Procedure_1");
		this_exp.procedure = "Procedure_1";
	} else {
		this_exp.procedure = this_exp[proc_values[0]];
	}
	if(stim_values.indexOf("Stimuli_1") !== -1){
		$('#stim_select').val("Stimuli_1");
		this_exp.stimuli = "Stimuli_1";
	} else {
		this_exp.stimuli = this_exp[stim_values[0]];
	}
}
function stim_proc_selection(stim_proc,sheet_selected){
	var this_exp   = master_json.exp_mgmt.experiments[$("#experiment_list").val()];
	createExpEditorHoT(this_exp.all_stims[sheet_selected],stim_proc,sheet_selected);	//sheet_name
}
function synch_experiment(entry_name){
	dbx.sharingCreateSharedLink({path:"/experiments/" + entry_name + ".json"})
		.then(function(result){
			$.get(result.url.replace("www.","dl."), function(exp_json){
				master_json.exp_mgmt.experiments[entry_name] = JSON.parse(exp_json);
			});
		})
		.catch(function(error){
			Collector.tests.report_error("problem synching the experiment","problem synching the experiment");
		});
}
function update_dropdown_lists(){
	var this_exp   = master_json.exp_mgmt.experiments[$("#experiment_list").val()];
	var stim_values = [];
	var proc_values = [];

  //wipe the stimuli list
  $('#proc_select').find('option').remove();
  $('#stim_select').find('option').remove();

  //wipe the procedure list

	Object.keys(this_exp.all_procs).forEach(function(this_proc){
		proc_values.push(this_proc);
		$('#proc_select').append($('<option>', {
			value: 	this_proc,
			text: 	this_proc
		}));
	});
	Object.keys(this_exp.all_stims).forEach(function(this_stim){
		stim_values.push(this_stim);
		$('#stim_select').append($('<option>', {
			value: 	this_stim,
			text: 	this_stim
		}));
	});
	stim_proc_defaults(proc_values,stim_values);
}
function update_handsontables(){
	var this_exp   = master_json.exp_mgmt.experiments[$("#experiment_list").val()];

	update_dropdown_lists();
  stim_file = Object.keys(this_exp.all_stims)[0];
  proc_file = Object.keys(this_exp.all_procs)[0];


	function load_spreadsheet(experiment,
														sheet_type,
														sheet_name,
													  exp_mgmt_location,
														sheet_content){
    console.dir("sheet_content");
    console.dir(sheet_content);
    if(sheet_content.split(",").length > 1){
      createExpEditorHoT(sheet_content,
												 sheet_type,
												 sheet_name);
		} else {
      var sheet_json = master_json.exp_mgmt
																	.experiments[experiment]
																	[exp_mgmt_location];
			createExpEditorHoT(sheet_json,
												 sheet_type,
												 sheet_name);
		}
	}

  switch(Collector.detect_context()){
      case "localhost":
				var conditions_sheet = Collector.electron.fs.read_file(
          "Experiments/"  + $("#experiment_list").val(),
				  "conditions.csv"
        );

			 if(conditions_sheet == ""){
				 conditions_sheet = Papa.unparse(
           master_json
             .exp_mgmt
             .experiments
             [$("#experiment_list").val()]
             .conditions
         );
			 }
       load_spreadsheet(
         $("#experiment_list").val(),
				 "Conditions",
				 "conditions.csv",
				 "conditions",
				 conditions_sheet
      );

	    var stim_sheet = Collector.electron.fs.read_file(
        "Experiments/" + $("#experiment_list").val(),
				stim_file
      );
		  if(stim_sheet == ""){
				 stim_sheet = Papa.unparse(
           master_json
             .exp_mgmt
             .experiments
             [$("#experiment_list").val()]
             .all_stims[stim_file]
         );
       }
       load_spreadsheet(
         $("#experiment_list").val(),
				 "Stimuli",
				 stim_file,
				 "all_stims[sheet_name]",
				 stim_sheet
       );

       var proc_sheet = Collector.electron.fs.read_file(
         "Experiments/"  + $("#experiment_list").val(),
       	 proc_file
       );
			 if(proc_sheet == ""){
				 proc_sheet = Papa.unparse(
           master_json
            .exp_mgmt
            .experiments
            [$("#experiment_list").val()]
            .all_procs[proc_file]);
			 }
       load_spreadsheet(
         $("#experiment_list").val(),
         "Procedure",
         proc_file,
         "all_procs[sheet_name]",
				 proc_sheet
       );
       break;
      case "github":
      default:
      	createExpEditorHoT(this_exp.all_stims[stim_file], "Stimuli",   stim_file);
        createExpEditorHoT(this_exp.all_procs[proc_file], "Procedure", proc_file);
        createExpEditorHoT(this_exp.cond_array, "Conditions","Conditions.csv");
        break;

  }
	$("#dropbox_inputs").show();
}
function update_master_json(){
	dbx_obj.new_upload({path:"/master.json",
                      contents:JSON.stringify(master_json,null,2),
                      mode:'overwrite'},
                      function(result){

	},function(error){
		bootbox.alert(error.error + "<br> Perhaps wait a bit and save again?");
	},
	"filesUpload");
};


function upload_exp_contents(these_contents,this_filename){
  parsed_contents  = JSON.parse(these_contents)
	cleaned_filename = this_filename.toLowerCase().replace(".json","");

	// note that this is a local function. right?
	function upload_to_master_json(exp_name,this_content) {
		master_json.exp_mgmt.experiments[exp_name] = this_content;
		list_studies();
    upload_trialtypes(this_content);
    upload_surveys(this_content);
    list_surveys();
	}
  function upload_surveys(this_content){
    function unique_survey(suggested_name,survey_content){
      all_surveys = Object.keys(master_json.surveys.user_surveys).concat(Object.keys(master_json.surveys.default_surveys));
      if(all_surveys.indexOf(suggested_name) !== -1){
        bootbox.prompt("<b>" + suggested_name + "</b> is taken. Please suggest another name, or press cancel if you don't want to save this survey?",function(new_name){
          if(new_name){
            unique_survey(new_name,survey_content);
          }
        });
      } else {
        master_json.surveys.user_surveys[suggested_name] = survey_content;
      }
    }


    Object.keys(this_content.surveys).forEach(function(this_survey){
      unique_survey(this_survey,this_content.surveys[this_survey]);
    });
  }
	function upload_trialtypes(this_content){
		var trialtypes = Object.keys(this_content.trialtypes);
		trialtypes.forEach(function(trialtype){

      function unique_trialtype(suggested_name,trialtype_content){
        all_trialtypes = Object.keys(master_json.trialtypes.user_trialtypes).concat(Object.keys(master_json.trialtypes.default_trialtypes));
        if(all_trialtypes.indexOf(suggested_name) !== -1){
          bootbox.prompt("<b>" + suggested_name + "</b> is taken. Please suggest another name, or press cancel if you don't want to save this trialtype?",function(new_name){
            if(new_name){
              unique_trialtype(new_name,trialtype_content);
            }
          });
        } else {
          master_json.trialtypes.user_trialtypes[suggested_name] = trialtype_content;
          list_trialtypes();
        }
      }

			// ask the user if they want to replace the trialtype
      unique_trialtype(trialtype,this_content.trialtypes[trialtype]);
		});
	}

	bootbox.prompt({
		title: "Save experiment?",
		message: "Please confirm that you would like to upload this experiment and if so, what you would like to call it?",
		value: cleaned_filename,

		callback: function(exp_name){
      if(exp_name){
        function unique_experiment(suggested_name,content){
          all_experiments = Object.keys(master_json.exp_mgmt.experiments);
          if(all_experiments.indexOf(suggested_name) !== -1){
            bootbox.prompt("<b>" + suggested_name + "</b> is taken. Please suggest another name, or press cancel if you don't want to save this experiment?",function(new_name){
              if(new_name){
                unique_experiment(new_name,content);
              } else {
                upload_to_master_json(exp_name,parsed_contents);
								$("#save_btn").click();
              }
            });
          } else {
            master_json.exp_mgmt.experiments[suggested_name] = content;
            list_studies();
            $("#upload_experiment_modal").hide();
            upload_to_master_json(exp_name,parsed_contents);
						$("#save_btn").click();
          }
        }
        unique_experiment(exp_name,parsed_contents);
      } else {
        upload_to_master_json(exp_name,parsed_contents);
				$("#save_btn").click();
      }
		}
	});
}
