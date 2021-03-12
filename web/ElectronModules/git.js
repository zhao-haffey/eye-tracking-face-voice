/*
* Detect if a mac device
*/
const fs   = require('fs-extra');

var root_dir = require("os").homedir() + "/Documents/Collector/";

//make sure there is a Collector folder in documents
if(!fs.existsSync(root_dir)){
  fs.mkdirSync(root_dir);
}

// make User folder if it doesn't exist yet
if(!fs.existsSync(root_dir + "/User")){
  fs.mkdirSync(root_dir + "/User");
}

/*
* Github management
*/
const ipc  = require('electron').ipcMain;
const { Octokit }     = require("@octokit/rest");
const simpleGit       = require('simple-git');

/*
* var git = simpleGit(); has to be called in individual functions to make sure it's fresh rather than has carrying over information from previous calls
*/
var commandExistsSync = require('command-exists').sync;
const git_token_location = root_dir + "repositories/Private/github_token.txt";

/*
* In alphabetical order
*/

ipc.on('git_add_changes', (event, args) => {

  /*
  * Update the cat folder using the local folder if in powershell/npm mode
  */
  if(fs.existsSync(
    "App"
  )){
    fs.copySync(
      "App",
      root_dir +
      "repositories"         + "/" +
        args["organization"] + "/" +
        args["repository"]   + "/" +
        "web"                + "/" +
        "App",
      {
        recursive: true
      }
    )
  }

  //copy folder from User folder into repository
  var baseline_time = (new Date()).getTime();
  console.log("baseline_time = " + baseline_time);

  fs.copySync(
    root_dir +
    "User",
    root_dir +
    "repositories"        + "/" +
      args["organization"] + "/" +
      args["repository"]   + "/" +
      "web"               + "/" +
      "User",
    {
      recursive:true
    }
  )
  console.log("copy time = " + parseFloat((new Date()).getTime() - baseline_time));
  event.returnValue = "success";
});

ipc.on('git_add_repo', (event,args) => {

  var auth_token = fs.readFileSync(
    git_token_location,
    'utf8'
  );

  /*
  * Check if the repository exists online
  */
  const octokit = new Octokit({
    auth: auth_token,
  });

  octokit.repos.get({
    owner: args["organization"],
    repo:  args["repository"]
  }).then(function(result){
    console.log("result of whether repository exists online:");
    console.log(result);
    /*
    * Then clone the repository
    */
    var git = simpleGit();
    git.clone(
      "https://github.com" + "/" +
        args["organization"] + "/" +
        args["repository"],
      root_dir +
      "repositories"         + "/" +
        args["organization"] + "/" +
        args["repository"]
    ).then(function(result){
      event.returnValue = "success"
    }).catch(function(error){
      event.returnValue = "error" + error;
    });
  }).catch(function(error){
    console.log("result of repository not existing online:");
    console.log(error);
    /*
    * Create repository online
    */
    octokit.repos.createInOrg({
      org:  args["organization"],
      name: args["repository"],
    }).then(function(result){
      console.log("now cloning Collector into the folder - right?")
      /*
      * Create repository locally
      */
      console.log("args:");
      console.log(args);
      console.log("git:");
      console.log(git);
      var git = simpleGit();
      git.clone(
        "https://github.com/scientific-open-solutions/collector",
        root_dir +
        "repositories"         + "/" +
          args["organization"] + "/" +
          args["repository"]
      ).then(function(result){
        console.log("cloning worked");
        console.log("result:");
        console.log(result);
        /*
        * Remove the local .git folder to prevent synching with scienitific-open-solutions version
        */
        fs.rmdirSync(
          root_dir +
          "repositories"        + "/" +
            args["organization"] + "/" +
            args["repository"]   + "/" +
            ".git",
           {
             recursive: true
           }
        );
        event.returnValue = "success"
      }).catch(function(error){
        console.log("cloning failed");
        event.returnValue = "failed to clone Collector onto your computer: " + error;
      });
    }).catch(function(error){
      console.log("failed to clone Collector into repository, right?");
      event.return = "error - failed to create online repo:" + error;
    })
  });

});

ipc.on('git_add_token', (event,args) => {
  /*
  * Make sure the required folders exist
  */
  if(!fs.existsSync(root_dir + "repositories")){
    fs.mkdirSync(root_dir + "repositories");
  }
  if(!fs.existsSync(root_dir + "repositories/Private")){
    fs.mkdirSync(root_dir + "repositories/Private");
  }

  try{
    fs.writeFileSync(
      git_token_location,
      args["auth_token"],
      'utf8'
    );
    event.returnValue = "success";
  } catch (error){
    event.returnValue = "error - could not add token to: " + git_token_location;
  }
});

ipc.on('git_delete_org', (event,args) => {
  try{
    fs.rmdirSync(
      root_dir +
      "repositories"         + "/" +
        args["organization"],
      {
         recursive: true
      }
    );
    event.returnValue = "success";
  } catch(error) {
    event.returnValue = "failed to delete: " + error
  }
});

ipc.on('git_delete_repo', (event,args) => {
  console.log("JSON.stringify(args)");
  console.log(JSON.stringify(args));

  try{
    fs.rmdirSync(
      root_dir +
      "repositories"         + "/" +
        args["organization"] + "/" +
        args["repository"],
      {
         recursive: true
      }
    );
    event.returnValue = "success";
  } catch(error) {
    event.returnValue = "failed to delete:" + error
  }
});

/*
* Expanding git_exists to check if there is a valid email
*/
ipc.on('git_exists', (event,args) => {
  if(commandExistsSync('git')){
    var git = simpleGit();
    git.listConfig().then(function(result){
      //console.log(result);

      /*
      * Check all configs for the relevant values
      */
      var user_email_valid = "false"

      Object.keys(result.values).forEach(function(item){
        if(typeof(result.values[item]["user.email"]) !== "undefined" && result.values[item]["user.email"] !== ""){
          user_email_valid = "true";
        }
      });
      event.returnValue = user_email_valid;
    }).catch(function(error){
      event.returnValue = error;
    });
  } else {
    event.returnValue = "Git is not yet installed. Please go to https://git-scm.com/ to download and install it so that you can do online research.";
  }
});

ipc.on('git_load_master', (event,args) => {
  if(!fs.existsSync(root_dir + "repositories")){
    fs.mkdirSync(root_dir + "repositories")
  }
  if(!fs.existsSync(root_dir + "repositories/github.json")){
    fs.writeFileSync(
      root_dir +
      "repositories/github.json",
      "{}",
      'utf8'
    );
  }
  var content = fs.readFileSync(
    root_dir +
    "repositories/github.json",
    'utf8'
  );
  event.returnValue = content;
});

ipc.on('git_pages', (event,args) => {

  /*
  * confirm authentication file exists
  */
  var auth_token = fs.readFileSync(
    git_token_location,
    'utf8'
  );

  /*
  * Check if the repository already is a github page
  */
  const octokit = new Octokit({
    auth: auth_token,
  }).repos.getPages({
    "owner":          args["organization"],
    "repo":           args["repository"]
  }).then(function(results){
    event.returnValue = "success";
  }).catch(function(error){
    try{
      const octokit = new Octokit({
        auth: auth_token,
      }).repos.createPagesSite({
        "owner":          args["organization"],
        "repo":           args["repository"],
        "source": {
          "branch" : "master",
          "path"   : "/"
        }
      }).then(function(result){
        event.returnValue = "success";
      }).catch(function(error){
        event.returnValue = "error: " + error;
      });
    } catch(error){
      console.log("HERE BE THE ERROR");
      event.returnValue = "error: " + error;
    }
  });
});

ipc.on('git_pull', (event,args) => {
  if(!fs.existsSync(root_dir + "repositories")){
    fs.mkdirSync(root_dir + "repositories");
  }

  if(!fs.existsSync(root_dir + "repositories" + "/" + args["organization"])){
    fs.mkdirSync(
      root_dir +
      "repositories"      + "/" +
      args["organization"]
    )
  }
  /*
  * check if repo exists to confirm whether cloning or pulling
  */
  if(
    !fs.existsSync(
      root_dir +
      "repositories"      + "/" +
      args["organization"] + "/" +
      args["repository"]
    )
  ){
    console.log("Repository doesn't exist locally, so cloning");
    //cloning
    var git = simpleGit();
    git.clone(
      "https://github.com"   + "/" +
        args["organization"] + "/" +
        args["repository"],
      root_dir +
        "repositories"       + "/" +
        args["organization"] + "/" +
        args["repository"]
    )
    .then(function(error){
      //copy and replace the "User" folder
      fs.copySync(
        root_dir +
        "repositories"         + "/" +
          args["organization"] + "/" +
          args["repository"]   + "/" +
          "web"                + "/" +
          "User",
        root_dir +
        "User"
      );
      event.returnValue = "success";
    })
    .catch(function(error){
      event.returnValue = "error: " + error;
    });
  } else {
    console.log("Repository exists locally, so pulling in changes");

    var remote =  "https://" +
                    args["organization"] +
                    "@github.com"        + "/" +
                    args["organization"] + "/" +
                    args["repository"]   + ".git";

    /*
    for debugging
    const simpleGit          = require('simple-git');
    const git                = simpleGit();
    */

    console.log("remote = " + remote);

    try{
      var git = simpleGit();
      git.cwd(
        root_dir +
        "repositories"      + "/" +
        args["organization"] + "/" +
        args["repository"]
      ).pull(
        remote,
        'master'
      ).then(function(result){

        /*
        * delete User folder before copying over it
        */
        fs.rmdirSync(
          root_dir +
          "User", {
            recursive: true
          }
        )

        try{
          fs.copySync(
            root_dir +
            "repositories"         + "/" +
              args["organization"] + "/" +
              args["repository"]   + "/" +
              "web"                + "/" +
              "User",
            root_dir +
            "User", {
              recursive: true
            }
          );
          console.log("succesfully copied over the local user folder using the updated repository");
          event.returnValue = "success";
        } catch(error){
          console.log("failed to copy over the local user folder using the updated repository");
          event.returnValue = "failed to switch to the new repository - are you sure this is a valid Collector repository (e.g. has a user folder)";
        }

      }).catch(function(error){
        console.log("error");
        console.log(error);
        event.returnValue = "error: " + error;
      });
    } catch(error){
      event.returnValue = "error:" + error
    }
  }
});

ipc.on('git_push', (event,args) => {
  /*
  * check that auth token exists and deal with eventuality if it doesn't
  */

  var baseline_time = (new Date()).getTime();
  console.log("baseline_time = " + baseline_time);


  var auth_token = fs.readFileSync(
    git_token_location,
    'utf8'
  );

  console.log("auth token time = " + parseFloat((new Date()).getTime() - baseline_time));

  if(typeof(args["message"]) == "undefined"){
    args["message"] = "automatic commit"
  }


  var remote =  "https://" +
                  args["organization"] + ":" +
                  auth_token +
                  "@github.com"        + "/" +
                  args["organization"] + "/" +
                  args["repository"]   + ".git";
  var git = simpleGit();
  git.cwd(
    root_dir +
    "repositories"       + "/" +
    args["organization"] + "/" +
    args["repository"]
  ).init().
    add("./*").
    commit(args["message"]).
    push(remote, 'master').
    then(function(new_err){
      console.log("success");
      console.log(new_err)
      event.returnValue = "success";
    })
    .catch(function(error){
      console.log("error");
      console.log(error)
      event.returnValue = "error when pushing:" + error;
    });
});

ipc.on('git_save_master', (event,args) => {
  fs.writeFileSync(
    root_dir +
    "repositories/github.json",
    args["git_master_json"],
    'utf8'
  );
  event.returnValue = "success";
});

ipc.on('git_set_email', (event, args) => {
  console.log(args["email"]);
  var git = simpleGit();
      git.addConfig("user.email", args["email"]);
  event.returnValue = "success";
});

ipc.on('git_status', (event, args) =>{
  var git = simpleGit();

  git.cwd(
    root_dir +
    "repositories"      + "/" +
    args["organization"] + "/" +
    args["repository"]
  ).fetch().status().then(function(result){
    event.returnValue = result.behind;
  }).catch(function(error){
    event.returnValue = error;
  });
});

ipc.on('git_switch_repo', (event, args) => {
  try{
    /*
    * backup the old repo
    */
    if(
      !fs.existsSync(
        root_dir +
        "repositories"         + "/" +
          args["organization"] + "/" +
          args["repository"]   + "/" +
          "web"                + "/" +
          "User"
      )
    ){
      fs.mkdirSync(
        root_dir +
        "repositories"         + "/" +
          args["organization"] + "/" +
          args["repository"]   + "/" +
          "web"                + "/" +
          "User"
      )
    }
    if(typeof(args["old_repo"]) !== "undefined"){
      try{
        fs.copySync(
          root_dir +
          "User",
          root_dir +
          "repositories"    + "/" +
            args["old_org"] + "/" +
            args["old_rep"] + "/" +
            "web"           + "/" +
            "User"
        );
      } catch(error){
        // hopefully can just skip this if an error occurs
        console.log("error = " + error);
      }
    }

    /*
    * Copy the selected repo
    */
    fs.rmdirSync(
      root_dir +
      "User", {
        recursive: true
      }
    )
    fs.copySync(
      root_dir +
      "repositories"         + "/" +
        args["organization"] + "/" +
        args["repository"]   + "/" +
        "web"                + "/" +
        "User",
      root_dir +
      "User", {
        recursive: true
      }
    );
    event.returnValue = "success";
  } catch(error){
    event.returnValue = "error: " + error;
  }
});

ipc.on('git_token_exists', (event,args) => {
  if (
    fs.existsSync(
      root_dir + "repositories/Private/github_token.txt"
    )
  ) {
    event.returnValue =  "success";
  } else {
    event.returnValue = "Did not find the token";
  }
});

ipc.on('git_valid_org', (event, args) => {
  /*
  * Make sure the relevant folders are ready
  */
  if(!fs.existsSync(root_dir + "repositories")){
    fs.mkdirSync(root_dir + "repositories");
  }

  if(!fs.existsSync(root_dir + "repositories" + "/" + args["organization"])){
    fs.mkdirSync(
      root_dir +
      "repositories"       + "/" +
      args["organization"]
    )
  }
  var auth_token = fs.readFileSync(
    git_token_location,
    'utf8'
  );
  const octokit = new Octokit({
    auth: auth_token,
  });
  console.log(auth_token);
  console.log("octokit");
  console.log(octokit);

  /*

  octokit.orgs.get({
    org: args["organization"]
  }).then(function(result){
    console.dir("success");
  }).catch(function(error){
    console.dir("error: " + error);
  });

  */

  octokit.orgs.get({
    org: args["organization"]
  }).then(function(result){
    event.returnValue = "success";
  }).catch(function(error){
    event.returnValue = "error: " + error;
  });
});
