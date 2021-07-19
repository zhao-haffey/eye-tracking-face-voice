function correct_master(){
  master = JSON.parse(
    Collector.electron.fs.read_file("", "master.json")
  );
  /*
  * missing objects
  */
  master.data = Collector.missing_object(master.data);
  master.data.servers = Collector.missing_object(master.data.servers);

  master.surveys.user_surveys = Collector.missing_object(master.surveys.user_surveys);

  master.code               = Collector.missing_object(master.code);
  master.code.graphic       = Collector.missing_object(master.code.graphic);
  master.code.graphic.files = Collector.missing_object(master.code.graphic.files);

  /*
  * studies --> projects
  */

  if(typeof(master.project_mgmt) == "undefined"){
    master.project_mgmt = master.exp_mgmt;

    master.project_mgmt = Collector.missing_object(master.project_mgmt);

    if(typeof(master.project_mgmt.experiment) !== "undefined"){
      master.project_mgmt.project  = master.project_mgmt.experiment;
    }
    master.project_mgmt.projects = master.project_mgmt.experiments;
    delete(master.project_mgmt.experiment);
    delete(master.project_mgmt.experiments);
  }

  master.project_mgmt.projects = Collector.missing_object(master.project_mgmt.projects);
  master.mods = Collector.missing_object(master.mods);


  var projects = Object.keys(master.project_mgmt.projects);
  projects.forEach(function(project){

    try{
      var this_project = master.project_mgmt.projects[project];


      /*
      * "trial type" --> "code" for each project
      */
      var all_procs = Object.keys(this_project.all_procs);
      all_procs.forEach(function(this_proc){
        if(typeof(this_project.all_procs[this_proc]) == "object"){
          this_project.all_procs[this_proc] = Papa.unparse(this_project.all_procs[this_proc]);
        }
        this_project.all_procs[this_proc] = this_project
          .all_procs[this_proc].replace("trial type,","code,");

        this_project.all_procs[this_proc] = Collector.PapaParsed(this_project.all_procs[this_proc]);

      });
      if(typeof(this_project.trialtypes) !== "undefined"){
        this_project.code = this_project.trialtypes;
        delete(this_project.trialtypes);
      }
    } catch(error){
      console.log("skipping this");
    }

  });

  /*
  * "trialtype" --> code for master
  */
  if(typeof(master.trialtypes) !== "undefined"){
    master.code         = master.trialtypes;
    master.code.default = master.code.default_trialtypes;
    master.code.file    = master.code.file;
    master.code.user    = master.code.user_codes;
    delete(master.trialtype);
    delete(master.trialtypes);
    delete(master.code.default_trialtypes);
    delete(master.code.user_codes);
  }
  master.code.default = Collector.missing_object(master.code.default);
  master.code.user = Collector.missing_object(master.code.user);

  if(typeof(master.code.user_trialtypes) !== "undefined"){
    Object.keys(master.code.user_trialtypes).forEach(function(item){
      if(typeof(master.code.user[item]) == "undefined"){
        master.code.user[item] = master.code.user_trialtypes[item];
      }
    });
  }
  master.code.graphic       = Collector.missing_object(master.code.graphic);
  master.code.graphic.files = Collector.missing_object(master.code.graphic.files);

  if(typeof(master.code.graphic.files) == "undefined" &
     typeof(master.code.graphic.trialtypes) !== "undefined"){
    master.code.graphic.files = master.code.graphic.trialtypes;
  }


  /*
  * remove any duplicates of default code fiels in the user
  */
  var default_code_files = Object.keys(master.code.default);
  default_code_files.forEach(function(default_file){
    delete(master.code.user[default_file]);
  });
}

function correct_user(){
  if(typeof(user.data_folder) == "undefined" || user.data_folder == ""){
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

Collector = {
  clean_obj_keys: function(this_obj){
    Object.keys(this_obj).forEach(function(this_key){
      clean_key = this_key.toLowerCase().replace(".csv","");
      this_obj[clean_key] = this_obj[this_key];
      if(this_key !== clean_key){
        delete(this_obj[this_key]);
      }
    });
    return this_obj;
  },
  complete_csv: function(this_csv){
    response_headers      = [];
    for(var i = 0; i < this_csv.length ; i++) {
      csv_row = this_csv[i];
      Object.keys(csv_row).forEach(function(header){
        if(response_headers.indexOf(header) == -1){
          response_headers.push(header);
        }
      });
    }
    for(var i =0; i < this_csv.length; i++){
      response_headers.forEach(function(this_header){
        if(typeof(this_csv[i][this_header]) == "undefined"){
          this_csv[i][this_header] = "";
        }
      });
    }
    return this_csv;
  },
  custom_alert: function(msg, duration) {

    if(typeof(duration) == "undefined"){
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
      console.log("animation_active");
      console.log(animation_active);
      if(animation_active == true){
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



  },
  detect_context: function(){
    //turn to false to make use of eel and python
    if(typeof(parent.dropbox_developer) !== "undefined"){
      if(parent.dropbox_developer  ==  true){
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
  },
  download_file: function(filename,content,type){
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
  },
  list_variables: function(trialtype){
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
  },
  makeid: function(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  missing_object: function(this_obj){
    if(typeof(this_obj) == "undefined"){
      return {};
    } else {
      return this_obj;
    }
  },
  PapaParsed: function(content){
    //check if parsed stylesheet
    if(typeof(content) == "object"){
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
  },
  save_data: function(filename, data) {
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
  },
  save_user: function(){
    Collector.electron.fs.write_user(JSON.stringify(user, null, 2));
  },
  start: function(){
    user = JSON.parse(Collector.electron.fs.load_user());
    if(typeof(user.current) == "undefined" || typeof(user.current.path) == "undefined"){
      var github_dialog_exists = setInterval(function(){
        if($("#github_dialog").length == 1){
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
      list_code();
      initiate_actions();
      list_keys();
      list_data_servers();
      list_servers();
      list_surveys();
      list_pathways();
    }
  },
  //https://stackoverflow.com/a/20745721/4490801
  timer: function(callback, delay) {
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
  },

  version: "cat"
};
