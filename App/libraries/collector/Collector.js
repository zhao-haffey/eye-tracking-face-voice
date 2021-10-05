
function correct_master(){
  master = Collector.electron.fs.read_file("", "master.json");
  if(master === ""){
    /* load from default */
    master = Collector.electron.fs.read_default("", "master.json")
  }
  master = JSON.parse(master);

  /*
  * missing objects
  */
  master.data = Collector.missing_object(master.data);
  master.data.servers = Collector.missing_object(master.data.servers);

  master.surveys.user_surveys = Collector.missing_object(master.surveys.user_surveys);

  if(typeof(master.phasetypes) !== "undefined"){
    master.phasetypes = master.phasetypes;
    delete(master.phasetypes);
  }

  /*
  * "trialtype" --> code for master
  */

  if(typeof(master.trialtypes) !== "undefined"){
    master.phasetypes         = master.trialtypes;
    master.phasetypes.default = master.phasetypes.default_trialtypes;
    master.phasetypes.user    = master.phasetypes.user_codes;
    delete(master.trialtype);
    delete(master.trialtypes);
    delete(master.phasetypes.default_trialtypes);
    delete(master.phasetypes.user_codes);
  }
  master.phasetypes         = Collector.missing_object(master.phasetypes);
  master.phasetypes.default = Collector
    .missing_object(master.phasetypes.default);
  master.phasetypes.user = Collector
    .missing_object(master.phasetypes.user);
  master.phasetypes.graphic = Collector
    .missing_object(master.phasetypes.graphic);
  master.phasetypes.graphic.files = Collector
    .missing_object(master.phasetypes.graphic.files);

  /*
  * studies --> projects
  */

  if(typeof(master.projects) === "undefined"){
    if(typeof(master.exp_mgmt) !== "undefined"){
      master.projects = master.exp_mgmt;
    } else {
      master.projects = master.project_mgmt;
    }

    master.projects = Collector.missing_object(master.projects);

    if(typeof(master.projects.experiment) !== "undefined"){
      master.projects.project  = master.projects.experiment;
    }
    master.projects.projects = master.projects.experiments;
  }
  delete(master.project_mgmt);
  delete(master.projects.experiment);
  delete(master.projects.experiments);

  master.projects.projects = Collector.missing_object(master.projects.projects);

  var projects = Object.keys(master.projects.projects);
  projects.forEach(function(project){

    try{
      var this_project = master.projects.projects[project];


      /*
      * "trial type" --> "code" for each project
      */
      var all_procs = Object.keys(this_project.all_procs);
      all_procs.forEach(function(this_proc){
        if(typeof(this_project.all_procs[this_proc]) === "object"){
          this_project.all_procs[this_proc] = Papa.unparse(this_project.all_procs[this_proc]);
        }
        this_project.all_procs[this_proc] = this_project
          .all_procs[this_proc].replace("trial type,","code,");

        this_project.all_procs[this_proc] = Collector.PapaParsed(this_project.all_procs[this_proc]);

      });
      if(typeof(this_project.trialtypes) !== "undefined"){
        this_project.phasetypes = this_project.trialtypes;
        delete(this_project.trialtypes);
      }
    } catch(error){
      console.log("skipping this");
    }

  });

  if(typeof(master.code) !== "undefined"){
    master.phasetypes = master.code;
    delete(master.code);
  }


  if(typeof(master.phasetypes.user_trialtypes) !== "undefined"){
    Object.keys(master.phasetypes.user_trialtypes).forEach(function(item){
      if(typeof(master.phasetypes.user[item]) === "undefined"){
        master.phasetypes.user[item] = master.phasetypes.user_trialtypes[item];
      }
    });
  }
  master.phasetypes.graphic = Collector
    .missing_object(master.phasetypes.graphic);
  master.phasetypes.graphic.files = Collector
    .missing_object(master.phasetypes.graphic.files);

  if(typeof(master.phasetypes.graphic.files) === "undefined" &
     typeof(master.phasetypes.graphic.trialtypes) !== "undefined"){
    master.phasetypes.graphic.files = master.phasetypes.graphic.trialtypes;
  }


  /*
  * remove any duplicates of default code fiels in the user
  */
  var default_code_files = Object.keys(master.phasetypes.default);
  default_code_files.forEach(function(default_file){
    delete(master.phasetypes.user[default_file]);
  });
}

function correct_user(){
  if(typeof(user.data_folder) === "undefined" || user.data_folder === ""){
    bootbox.confirm("You don't (yet) have a folder where we'll put your data <b>when you test participants <u>on this device</u></b>. You're about to be asked where you would like this data to go. Please think carefully about this to make sure that your participant data is secure.", function(result){
      if(result){
        var data_folder = Collector.electron.find_path()[0];
        if(data_folder){
          user.data_folder = data_folder;
          $("#local_data_folder").val(data_folder);
          Collector.save_user();
        }
      }
    });
  } else {
    $("#local_data_folder").val(user.data_folder);
  }
}
if(typeof(Collector) == "undefined"){
  Collector = {};
}

Collector.clean_string = function(this_string){
    return this_string
    .replaceAll(" ", "_")
    .replaceAll(" ", "_")
    .replaceAll("-", "_")
    .replaceAll("@", "_at_")
    .replaceAll(".", "_dot_")
    .replaceAll("/", "_forward_slash_")
    .replaceAll("\\", "_back_slash")
    .replaceAll("'", "_single_quote_")
    .replaceAll('"', "_double_quote_")
    .replaceAll("|", "_pipe_")
    .replaceAll("?", "_question_")
    .replaceAll("#", "_hash_")
    .replaceAll(",", "_comma_")
    .replaceAll("[", "_square_open_")
    .replaceAll("]", "_square_close_")
    .replaceAll("(", "_bracket_open_")
    .replaceAll(")", "_bracket_close_")
    .replaceAll("*", "__")
    .replaceAll("^", "__")
    .replaceAll(":", "__")
    .replaceAll(";", "__")
    .replaceAll("%", "__")
    .replaceAll("$", "__")
    .replaceAll("£", "__")
    .replaceAll("!", "__")
    .replaceAll("`", "__")
    .replaceAll("+", "__")
    .replaceAll("=", "__")
    .replaceAll("<", "__")
    .replaceAll(">", "__")
    .replaceAll("~", "__");
  };
Collector.clean_obj_keys= function(this_obj){
  Object.keys(this_obj).forEach(function(this_key){
    clean_key = this_key.toLowerCase().replace(".csv","");
    this_obj[clean_key] = this_obj[this_key];
    if(this_key !== clean_key){
      delete(this_obj[this_key]);
    }
  });
  return this_obj;
};
Collector.complete_csv= function(this_csv){
  response_headers      = [];
  for(var i = 0; i < this_csv.length ; i++) {
    csv_row = this_csv[i];
    Object.keys(csv_row).forEach(function(header){
      if(response_headers.indexOf(header) === -1){
        response_headers.push(header);
      }
    });
  }
  for(var i =0; i < this_csv.length; i++){
    response_headers.forEach(function(this_header){
      if(typeof(this_csv[i][this_header]) === "undefined"){
        this_csv[i][this_header] = "";
      }
    });
  }
  return this_csv;
}
Collector.custom_alert= function(msg, duration) {

  if(typeof(duration) === "undefined"){
    duration = 3000;
  }

  var top_padding = parseFloat(
    $("#sim_navbar").css("height").replace("px","")) +
    parseFloat($("#top_navbar").css("height").replace("px","")
  );
  var this_background_color;
  var border_color; //"#DAA";
  var this_color;
  if(msg.toLowerCase().indexOf("alert") !== -1){
    this_background_color = "#ffc8c8";
    border_color = "#800";
    this_color = "#800";
  } else {
    this_background_color = "#96ffa8";
    border_color = "#24402a";
    this_color = "#24402a";
  }

  var this_alert = $("<div>")
    .css({
      backgroundColor:  this_background_color,
      border:           "3px solid " + border_color,
      borderRadius:     "6px",
      color:            this_color,
      "font-size":      "20px",
      left:             "10px",
      // margin:           "10px 5px",
      opacity:          "0",
      padding:          "20px",
      position:         "fixed",
      right:            "10px",
      top:              (top_padding + 20) + "px",
      "z-index":        1000
    })
    .html(msg + " (click to keep on screen and click again to hide)");
  /*
  - need to think through how to avoid multiple redundant elements through appending...
  */


  $("body").append(this_alert);
  this_alert.animate(
    {opacity: "1"},
    500,
    "swing"
  );


  var animation_active = true;
  this_alert.click(function(){
    if(animation_active === true){
      animation_active = false;
      this_alert.stop();
    } else {
      $(this).animate({
        opacity:  "0"
      }, 500, "swing", function() {
        $(this).remove();
      });
    }
  });

  setTimeout(function() {
    if(animation_active){
      $(this_alert).animate({
        opacity:  "0"
      }, 500, "swing", function() {
        $(this_alert).remove();
      });
    }
  },duration);
}

Collector.detect_context= function(){
  //turn to false to make use of eel and python
  if(typeof(parent.dropbox_developer) !== "undefined"){
    if(parent.dropbox_developer  ===  true){
      return "github";
    } else {
      return "localhost";
    }
  } else if(document.URL.indexOf("github.io") !== -1) { //assume it's github
    return "github";
  } else if(document.URL.indexOf("gitpod.io") !== -1){
    return "gitpod";
  } else {
    return "server";
  }
};
Collector.download_file= function(filename,content,type){
  var blob = new Blob([content], {type: 'text/' + type});
  if(window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  }  else{
    var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
};
Collector.list_variables = function(trialtype){
  var variables = [];

  split_trialtype = trialtype.split("{{");
  split_trialtype = split_trialtype.map(function(split_part){
    if(split_part.indexOf("}}") !== -1){
      more_split_part = split_part.split("}}");
      variables.push(more_split_part[0].toLowerCase());
      more_split_part[0] = more_split_part[0].toLowerCase();
      split_part = more_split_part.join("}}");
    }
    return split_part;
  });
  mod_html = split_trialtype.join("{{");
  return variables;
};
Collector.makeid = function(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
Collector.missing_object = function(this_obj){
  if(typeof(this_obj) === "undefined"){
    return {};
  } else {
    return this_obj;
  }
}
Collector.PapaParsed = function(content){
  //check if parsed stylesheet
  if(typeof(content) === "object"){
    post_parsed = Papa.parse(Papa.unparse(content),{
      beforeFirstChunk: function(chunk) {
        var rows = chunk.split( /\r\n|\r|\n/ );
        var headings = rows[0].toLowerCase();
        rows[0] = headings;
        return rows.join("\r\n");
      },
      header:true,
      skipEmptyLines:true
    }).data;
  } else {
    post_parsed = Papa.parse(content,{
      beforeFirstChunk: function(chunk) {
        var rows = chunk.split( /\r\n|\r|\n/ );
        var headings = rows[0].toLowerCase();
        rows[0] = headings;
        return rows.join("\r\n");
      },
      header:true,
      skipEmptyLines:true
    }).data;
  }
  /*
  * remove blank row(s)
  */
  post_parsed = post_parsed.filter(function(row){
    var not_empty = 0;
    Object.keys(row).forEach(function(key){
      if(row[key] !== ""){
        not_empty++;
      }
    });
    return not_empty > 0;
  });
  return post_parsed;
};
Collector.save_data = function(filename, data) {
  var blob = new Blob([data], {type: 'text/csv'});
  if(window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
};
Collector.save_user = function(){
  Collector.electron.fs.write_user(JSON.stringify(user, null, 2));
};
Collector.start = function(){
  user = JSON.parse(Collector.electron.fs.load_user());
  if(typeof(user.current) === "undefined" || typeof(user.current.path) === "undefined"){
    var github_dialog_exists = setInterval(function(){
      if($("#github_dialog").length === 1){
        clearInterval(github_dialog_exists);
        $("#github_dialog").show();
        bootbox.alert("It looks like you haven't yet included any github repositories for your projects. You need to have a github account and organisation to create a project. Once you've done that (see our <a href='https://docs.google.com/document/d/1SKYIJF1dAjMDS6EHUIwfZm2KQVOzx17S6LbU_oSGxdE/edit?usp=sharing' target='_blank'>documents</a>) you can use Collector to build your projects.");
      }
    },1000);
  } else {
    correct_master();
    correct_user();
    list_repos();
    list_projects();
    list_graphics();
    list_phasetypes();
    initiate_actions();
    list_keys();
    list_data_servers();
    list_servers();
    list_surveys();
    //list_pathways();
  }
};
//https://stackoverflow.com/a/20745721/4490801
Collector.timer = function(callback, delay) {
  var id, started, remaining = delay, running;
  this.start = function() {
    running = true;
    started = new Date();
    id = setTimeout(callback, remaining);
  };

  this.pause = function() {
    running = false;
    clearTimeout(id);
    remaining -= new Date() - started;
  };

  this.getTimeLeft = function() {
    if (running) {
      this.pause();
      this.start();
    }
    return remaining;
  };

  this.getStateRunning = function() {
    return running;
  };

  this.start();
};

Collector.version = "cat";
