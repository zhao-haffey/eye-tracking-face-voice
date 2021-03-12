window.onload=function(){
  const ipc      = require('electron').ipcRenderer;

  wait_for_collector = setInterval(function(){
    if(typeof(Collector) !== "undefined"){
      clearInterval(wait_for_collector);
      Collector.electron = {
        fs: {
          delete_experiment: function(
            exp_name,
            file_action
          ){
            delete_response = ipc.sendSync('fs_delete_experiment',{
              "exp_name" : exp_name
            });
            file_action(delete_response);
          },
          delete_file: function(
            file_path
          ){
            return ipc.sendSync(
              'fs_delete_file',{
                "file_path": file_path
              }
            );
          },
          delete_survey: function(
            survey_name,
            file_action
          ){
            return ipc.sendSync('fs_delete_survey',{
              "survey_name" : survey_name
            });
          },
          delete_trialtype: function(
            exp_name,
            file_action
          ){
            delete_response = ipc.sendSync('fs_delete_trialtype',{
              "trialtype_name" : exp_name
            });
            file_action(delete_response);
          },
          list_trialtypes: function(){
            return ipc.sendSync('fs_list_trialtypes');
          },
          home_dir: function(){
            return ipc.sendSync('fs_home_dir')
          },
          read_default: function(
            user_folder,
            this_file
          ){
            file_content = ipc.sendSync('fs_read_default',{
              "user_folder" : user_folder,
              "this_file"   : this_file
            });
            return file_content;
          },
          read_file: function(
            user_folder,
            this_file
          ){
            file_content = ipc.sendSync('fs_read_file',{
              "user_folder" : user_folder,
              "this_file"   : this_file
            });
            return file_content;
          },
          write_data: function(
            experiment_folder,
            this_file,
            file_content
          ){
            write_response = ipc.sendSync('fs_write_data',{
              "experiment_folder"  : experiment_folder,
              "this_file"          : this_file,
              "file_content"       : file_content
            });
            return write_response;
          },
          write_experiment: function(
            this_experiment,
            file_content,
            file_action
          ){
            write_response = ipc.sendSync('fs_write_experiment',{
              "this_experiment" : this_experiment,
              "file_content"    : file_content
            });
            file_action(write_response);
          },
          write_file: function(
            user_folder,
            this_file,
            file_content
          ){
            write_response = ipc.sendSync('fs_write_file',{
              "user_folder"  : user_folder,
              "this_file"    : this_file,
              "file_content" : file_content
            });
            return write_response;
          }
        },
        git:{
          add_changes: function(repo_info){
            return ipc.sendSync(
              'git_add_changes',
              repo_info
            );
          },
          add_repo: function(repo_info){
            return ipc.sendSync(
              'git_add_repo',
              repo_info
            );
          },
          add_token: function(auth_token){
            return ipc.sendSync(
              'git_add_token',{
              "auth_token": auth_token
            });
          },
          delete_org: function(org_info){
            return ipc.sendSync(
              'git_delete_org',
              org_info
            )
            return this_response;
          },
          delete_repo: function(repo_info){
            return ipc.sendSync(
              'git_delete_repo',
              repo_info
            )
            return this_response;
          },
          exists: function(){
            return this_response = ipc.sendSync(
              'git_exists'
            );
          },
          load_master: function(){
            return ipc.sendSync('git_load_master')
          },
          pages: function(repo_info){
            return ipc.sendSync(
              'git_pages',
              repo_info
            );
          },
          pull: function(repo_info){
            return ipc.sendSync(
              'git_pull',
              repo_info
            );
          },
          push: function(repo_info){
            return ipc.sendSync(
              'git_push',
              repo_info
            );
          },
          save_master: function(){
            var git_master_json = JSON.stringify(github_json);
            return ipc.sendSync(
              'git_save_master',
              {
                "git_master_json": git_master_json
              }
            )
          },
          set_email: function(email){
            return ipc.sendSync(
              'git_set_email',
              {
                email: email
              }
            )
          },
          status: function(repo_info){
            return ipc.sendSync('git_status', {
              organization: repo_info.organization,
              repository: repo_info.repository
            });
          },
          switch_repo: function(repo_info){
            return ipc.sendSync(
              'git_switch_repo',
              repo_info
            )
          },
          token_exists: function(){
            return ipc.sendSync(
              'git_token_exists',
              {}
            )
          },
          valid_org: function(repo_info){
            return ipc.sendSync(
              'git_valid_org',
              repo_info
            )
          }
        },
        open_folder: function(folder){
          return ipc.sendSync(
            'open_folder',
            {
              folder: folder
            }
          );
        }
      }
    }
  },100);
}
