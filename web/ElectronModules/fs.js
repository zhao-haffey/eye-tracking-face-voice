const fs   = require('fs-extra')
const ipc  = require('electron').ipcMain;
const Papa = require('papaparse');

var root_dir = require("os").homedir() + "/Documents/Collector/";

root_dir = root_dir.replaceAll("\\","\/");

//make sure there is a Collector folder in documents
if(!fs.existsSync(root_dir)){
  fs.mkdirSync(root_dir);
}

// make User folder if it doesn't exist yet
if(!fs.existsSync(root_dir + "/User")){
  fs.mkdirSync(root_dir + "/User");
}


/*
* fs functions in alphabetical order
*/

ipc.on('fs_delete_experiment', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["exp_name"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      // delete the file
      fs.unlinkSync(
        root_dir + "User/Experiments/" + args["exp_name"] + ".json"
      );
      // delete the folder
      fs.rmdirSync(
        root_dir + "User/Experiments/" + args["exp_name"],
         {
           recursive: true
         }
      );
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "failed to delete: " + error;
    }

  }
});

ipc.on('fs_delete_file', (event,args) => {
  if(args["file_path"].indexOf("../") !== -1){
    event.returnValue = "This attempt to delete a file looked dangerous, so hasn't been completed";
  } else if(!fs.existsSync(root_dir + "User/" + args["file_path"])){
    event.returnValue = "This file doesn't appear to exist, so could not be deleted on your computer (but also doesn't need to be deleted either.)";
  } else {
    fs.unlink(root_dir + "User/" + args["file_path"]);
    event.returnValue = "success";
  }
});

ipc.on('fs_delete_survey', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["survey_name"].indexOf("..") !== -1){
    event.returnValue = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.unlinkSync(root_dir + "User/Surveys/" +
                                  args["survey_name"].replace(".csv","") +
                                  ".csv");
      event.returnValue = "success";
    } catch(error){
      event.returnValue = "failed to delete the survey: " +
                          error;
    }

  }
});

ipc.on('fs_delete_trialtype', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["trialtype_name"].indexOf("..") !== -1){
    event.returnValue = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.unlinkSync(root_dir + "User/Trialtypes/" +
                                  args["trialtype_name"] +
                                  ".html");
      event.returnValue = "success";
    } catch(error){
      event.returnValue = "failed to delete the trialtype: " +
                          error;
    }

  }
});

ipc.on('fs_home_dir', (event,args) => {
  event.returnValue = root_dir;
});

ipc.on('fs_list_trialtypes', (event,args) => {
  /*
  * list all files in "Trialtypes" folder
  */
  event.returnValue = JSON.stringify(
    fs.readdirSync(root_dir + "User/Trialtypes")
  );
});

ipc.on('fs_read_default', (event,args) => {
  /*
  * Security checks - should probably have more
  */
  if(args["user_folder"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.readFileSync(
        "Default/Default"     +
          args["user_folder"] + "/" +
          args["this_file"]   + "/",
        'utf8'
      );
      event.returnValue = content;
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "";
    }

  }
});

ipc.on('fs_read_file', (event,args) => {
  /*
  * Security checks - should probably have more
  */
  if(args["user_folder"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    /*
    * create User folder if it doesn't exist (and all the relevant subfolders)
    */
    if(!fs.existsSync(root_dir + "User")){
      fs.mkdirSync(root_dir + "User");
    }
    if(!fs.existsSync(root_dir + "Data")){
      fs.mkdirSync(root_dir + "Data");
    }
    if(!fs.existsSync(root_dir + "User/Experiments")){
      fs.mkdirSync(root_dir + "User/Experiments");
    }
    if(!fs.existsSync(root_dir + "User/Pathway")){
      fs.mkdirSync(root_dir + "User/Pathway");
    }
    if(!fs.existsSync(root_dir + "User/Stimuli")){
      fs.mkdirSync(root_dir + "User/Stimuli");
    }
    if(!fs.existsSync(root_dir + "User/Surveys")){
      fs.mkdirSync(root_dir + "User/Surveys");
    }
    if(!fs.existsSync(root_dir + "User/Trialtypes")){
      fs.mkdirSync(root_dir + "User/Trialtypes");
    }

    try{
      var content = fs.readFileSync(root_dir + "User"                + "/" +
                                      args["user_folder"] + "/" +
                                      args["this_file"],
                                    'utf8');
      event.returnValue = content;
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "";
    }

  }
});

ipc.on('fs_write_data', (event,args) => {

  /*
  * Making sure the relevant folders exist
  */
  if(!fs.existsSync(root_dir + "User")){
    fs.mkdirSync(root_dir + "User");
  }
  if(!fs.existsSync(root_dir + "Data")){
    fs.mkdirSync(root_dir + "Data");
  }
  if(!fs.existsSync(root_dir + "User/Experiments")){
    fs.mkdirSync(root_dir + "User/Experiments");
  }
  if(!fs.existsSync(root_dir + "User/Pathway")){
    fs.mkdirSync(root_dir + "User/Pathway");
  }
  if(!fs.existsSync(root_dir + "User/Stimuli")){
    fs.mkdirSync(root_dir + "User/Stimuli");
  }
  if(!fs.existsSync(root_dir + "User/Surveys")){
    fs.mkdirSync(root_dir + "User/Surveys");
  }
  if(!fs.existsSync(root_dir + "User/Trialtypes")){
    fs.mkdirSync(root_dir + "User/Trialtypes");
  }


  /*
  * Security checks - should probably have more
  */

  if(args["experiment_folder"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{

      /*
      * create experiment folder if it doesn't exist yet
      */

      if(!fs.existsSync(
          root_dir + "Data/" + args["experiment_folder"]
        )
      ){
        fs.mkdirSync(
          root_dir + "Data/" + args["experiment_folder"]
        )
      }
      var content = fs.writeFileSync(
        root_dir + "Data/" + args["experiment_folder"] + "/" +
        args["this_file"]   ,
        args["file_content"],
        'utf8'
      );
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = error;
    }

  }

});

ipc.on('fs_write_experiment', (event,args) => {

  /*
  * Security checks - probably need more
  */

  if(args["this_experiment"].indexOf("..") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      /*
      * save JSON
      */
      fs.writeFileSync(
        root_dir + "User/Experiments/" +
         args["this_experiment"] + ".json",
         args["file_content"],
         'utf8'
       );

      /*
      * Create folder if it doesn't exist
      */
      if(!fs.existsSync(
          root_dir + "User/Experiments/" + args["this_experiment"]
        )
      ){
        fs.mkdirSync(
          root_dir + "User/Experiments/" + args["this_experiment"]
        )
      }


      parsed_contents = JSON.parse(args["file_content"]);

      /*
      * save specific csvs
      * - first need to parse each csv here
      */
      var conditions_csv = parsed_contents.conditions;

      fs.writeFileSync(
        root_dir + "User/Experiments/" +
          args["this_experiment"] + "/" +
          "conditions.csv",
          conditions_csv,
         "utf-8"
       );



       Object.keys(parsed_contents.all_procs).forEach(function(this_proc){
         fs.writeFileSync(
           root_dir + "User/Experiments/" +
            args["this_experiment"] + "/" +
            this_proc,
            parsed_contents.all_procs[this_proc]
          );
       });

       Object.keys(parsed_contents.all_stims).forEach(function(this_stim){
         fs.writeFileSync(
           root_dir + "User/Experiments/" +
            args["this_experiment"] + "/" +
            this_stim,
            parsed_contents.all_stims[this_stim]
          );
       });
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "failed to save " + error;
    }
  }
});

ipc.on('fs_write_file', (event,args) => {

  /*
  * Security checks - should probably have more
  */

  if(args["user_folder"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else if(args["this_file"].indexOf("../") !== -1){
    var content = "This request could be insecure, and was blocked";
  } else {
    try{
      var content = fs.writeFileSync(root_dir + "User/" +
                                       args["user_folder"] + "/" +
                                       args["this_file"],
                                       args["file_content"],
                                     'utf8');
      event.returnValue = "success";
    } catch(error){
      //to trigger an attempt to load a trialtype from the master_json
      event.returnValue = "failed to save";
    }

  }
});
