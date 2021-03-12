const {app,
       BrowserWindow,
       dialog,
       remote,
       shell} = require('electron')

const ipc  = require('electron').ipcMain;


ipc.on('open_folder', (event,args) => {

  if(process.platform.indexOf("win") !== -1){
    var location = require("os").homedir() +
    "\\Documents\\Collector\\" +
    args["folder"];
    location = location.replace("\/","\\");
  } else {
    var location = require("os").homedir() +
    "/Documents/Collector/" +
    args["folder"];
  }
  location = location.replace(
    "resources\\app.asar\\",
    ""
  );
  shell.showItemInFolder(
    location
  );
  event.returnValue = location;
});
