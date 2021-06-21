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
    function create_alerts_container() {
      if (typeof(alerts_ready) !== "undefined" && alerts_ready) return;

      var top_padding = parseFloat(
        $("#sim_navbar").css("height").replace("px","")) +
        parseFloat($("#top_navbar").css("height").replace("px","")
      );

      var this_background_color;
      var border_color; //"#DAA";
      var this_color;
      if(msg.toLowerCase().indexOf("alert") !== -1){
        this_background_color = "#ffc8c8";
        border_color = "#800"; //"#DAA";
        this_color = "#800";
      } else {
        this_background_color = "#96ffa8";
        border_color = "#24402a";
        this_color = "#24402a";
      }

      var el = $("<div>");
      el.css({
          position: "fixed",
          top: (top_padding+20) + "px",
          left: "10px",
          right: "10px",
          backgroundColor: this_background_color,
          borderRadius: "6px",
          border: "1px solid " + border_color,
          color: this_color
      });

      el.attr("id", "alerts");
      el.css("z-index", "1000");

      $("body").append(el);

      var style = $("<style>");
      style.html("#alerts > div { margin: 10px 5px; }");

      $("body").append(style);

      alerts_ready = true;
    }
    if(typeof(duration) == "undefined"){
      duration = 1000;
    }
    create_alerts_container();
    var el = $("<div>");
    el.html(msg);
    el.css("opacity", "0");
    $("#alerts").append(el).show();
    el.animate({opacity: "1"}, 600, "swing", function() {
      $(this).delay(duration).animate({height: "0px"}, 800, "swing", function() {
        $(this).remove();
        if ($("#alerts").html() === '') {
          $("#alerts").hide();
        }
      });
    });
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
  detect_exe: function(){
    $.get("../User/master.json",function(result){
      Collector.is_exe = false;
    }).catch(function(error){
      Collector.is_exe = true;
      console.log("the error above just means that you are using this as an app rather than online");
    });
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

/*
* Need to run this ASAP to have this info available later.
*/
Collector.detect_exe();

//////////////////////
// online solutions //
//////////////////////

// solution by csharptest.net at
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
//////////////////////////////////////////////////////////////////////////////////////////////
Collector.makeid = function(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/*
* functions added from other files
*/

/*
* SessionCheck.js
*/
// add session
// add create_session()
// add update_session()


/*
* by qwerty at
* https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
*/
String.prototype.replaceAll = function(str1, str2, ignore)
{
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};
