/*
 * Collector Survey 3.1.0
 */

/*
 * detect if testing or not
 */
if (typeof module !== "undefined") {
  // give message to developer during testing
  function appropriate_message(this_message) {
    console.log(appropriate_message);
  }
} else {
  // give message to participant
  function appropriate_message(this_message) {
    bootbox.alert(this_message);
  }
}

var home_dir = "";

var org_repo;
switch (parent.parent.Project.get_vars.platform) {
  case "simulateonline":
  case "localhost":
  case "preview":
    org_repo = parent.parent.project_json.location.split("/");
    home_dir = parent.parent.Collector.electron.git.locate_repo({
      org: org_repo[0],
      repo: org_repo[1],
    });
    break;
  default:
    home_dir = "..";
    break;
}

/*
 * this survey_js object is required to make testing works
 */
survey_js = {};

phasetype_obj = {};

types_list = [
  "checkbox",
  "checkbox_vertical",
  "checkbox_horizontal",
  "checkbox_single",
  "date",
  "dropdown",
  "select",
  "email",
  "google_slide",
  "jumbled",
  "instruct",
  "likert",
  "number",
  "para",
  "radio",
  "radio_vertical",
  "radio_horizontal",
  "report_score",
  "text",
];
/*
 * Retrieving settings
 */

if (typeof settings !== "undefined") {
  settings = [settings];
} else {
  settings = {};
}

/*
 * vertical vs. horizontal tabs
 */

if (
  typeof settings.tab_hor_vert === "undefined" ||
  settings.tab_hor_vert.toLowerCase() === "horizontal"
) {
  settings.tab_hor_vert = "horizontal";
  $("#survey_outline")
    .append(
      $("<div>").attr("id", "please_wait_div").html("Loading... Please wait")
    )
    .append(
      $("<div>")
        .addClass("needs-validation")
        .attr("id", "this_survey_id")
        .attr("novalidate", true)
    )
    .append(
      $("<div>")
        .attr("id", "survey_tabs")
        .addClass("border-top")
        .addClass("border-primary")
        .css("text-align", "right")
    );
} else if (settings.tab_hor_vert.toLowerCase() === "vertical") {
  $("#" + survey_outline).append(
    $("<table>").append(
      $("<tr>")
        .append(
          $("<td>")
            .prop("valign", "top")
            .addClass("border-right")
            .addClass("border-primary")
            .append($("<div>").prop("id", "survey_tabs"))
        )
        .append(
          $("<td>")
            .append(
              $("<div>")
                .prop("id", "please_wait_div")
                .html("Please wait while survey is downloading")
            )
            .append(
              $("<div>")
                .prop("id", "this_survey_id")
                .addClass("needs-validation")
                .attr("novalidate", true)
            )
        )
    )
  );
} else if (settings.tab_hor_vert.toLowerCase() === "none") {
  $("#survey_outline")
    .append($("<div>").css("display", "none").prop("id", "survey_tabs"))
    .append(
      $("<div>")
        .html("Please wait while survey is downloading")
        .prop("id", "please_wait_div")
    )
    .append(
      $("<div>")
        .class("needs-validation")
        .prop("id", "this_survey_id")
        .attr("novalidate", true)
    );
} else {
  appropriate_message(
    "If you are the researcher, please check the 'settings for this survey. The input for 'tab_hor_vert' appears to be invalid. Please change it to 'horizontal' or 'vertical' or 'none' or remove 'tab_hot_vert' altogether from the settings, which will make the tabs invisible"
  );
}

/*
 * Defining objects
 */

page_break_management = {
  breaks_remaining: 0,
  breaks_index: 0,
};

proceed_object = {
  type: [],
  name: [],
  break_no: [],
};

scoring_object = {
  scales: [],
  scale_scores: [],
  update_scales: function (this_survey) {
    headers = Object.keys(this_survey[0]);
    this.scales = headers.filter((elm) => elm.includes("score:"));
    var scales_html = "";
    this.scales.forEach(function (element) {
      element = element.replace(": ", ":");
      scales_html +=
        "<input name='" +
        element.replace(/ |:/g, "_") +
        "' class='score_total " +
        element.replace(/ |:/g, "_") +
        "' disabled>";
    });
    $("#scales_span").html(scales_html);
  },
};

survey_obj = {};

/*
 * Element actions
 */

/*
$(function() {
$( ".datepicker" ).datepicker({
  dateFormat : 'mm/dd/yy',
  changeMonth : true,
  changeYear : true,
  yearRange: '-100y:c+nn',
  maxDate: '-1d'
});
});
*/

$("#ExperimentContainer").css("transform", "scale(1,1)");
$("#proceed_button").on("click", function () {
  var proceed = true;
  var tabs = document.getElementsByClassName("show_tab active");
  if (tabs.length > 0) {
    var current_tab = document
      .getElementsByClassName("show_tab active")[0]
      .id.replace("_button", "")
      .replace("tab_", "");
    var response_elements = $("#table_" + current_tab).find(
      ".response_element"
    );
  } else {
    response_elements = $(".table_break:visible").find(".response_element");
  }
  for (var i = 0; i < response_elements.length; i++) {
    [row_no, item_name] = retrieve_row_no_item_name(response_elements[i]);
    if (typeof survey_obj.data[row_no].optional !== "undefined") {
      var this_optional = survey_obj.data[row_no].optional.toLowerCase();

      if (this_optional.indexOf("no") !== -1) {
        this_optional = this_optional.split("-"); // find out whether there's a minimal number of responses
        if (this_optional.length === 1) {
          // default is that length needs to be at least 1
          var min_resp_length = 1;
        } else if (this_optional.length === 2) {
          var min_resp_length = this_optional[1];
        } else {
          appropriate_message(
            "Error - you appear to have too many '-' characters in the 'optional' column"
          );
          return false;
        }
      } else {
        min_resp_length = 0;
      }

      var quest_resp = isJSON($("#" + response_elements[i].id).val());
      if (quest_resp.length < min_resp_length) {
        proceed = false;
        $("#" + response_elements[i].id.replace("response", "question"))
          .removeClass("text-dark")
          .removeClass("text-success")
          .addClass("text-danger");
      } else {
        $("#" + response_elements[i].id.replace("response", "question"))
          .removeClass("text-dark")
          .removeClass("text-danger")
          .addClass("text-success");
      }
    }
  }

  if (current_tab === survey_obj.tabs && proceed) {
    if (typeof sql_surveys === "undefined") {
      var next_table_no =
        parseFloat($(".table_break:visible")[0].id.replace("table", "")) + 1;

      if ($(".table_break#table" + next_table_no).length === 0) {
        if (typeof Phase !== "undefined") {
          Phase.submit();
        } else {
          appropriate_message(
            "You've finished! Click on the preview button to restart."
          );
        }
      } else {
        $(".table_break").hide();
        $(".table_break#table" + next_table_no).show();
      }
    } else {
      $("#" + survey_outline).append(
        $("<h1>").html("You have finished the preview of this survey.")
      );
    }
  } else if (current_tab < survey_obj.tabs && proceed) {
    current_tab++;
    $("#tab_" + current_tab + "_button").removeClass("btn-secondary");
    $("#tab_" + current_tab + "_button").removeClass("disabled");
    $("#tab_" + current_tab + "_button").addClass("btn-outline-dark");
    $("#tab_" + current_tab + "_button").click();
  } else if (proceed === false) {
    appropriate_message(
      "You're missing some responses. Please fill in all the answers for the questions in red above."
    );
  } else if (current_tab > survey_obj.tabs) {
    appropriate_message(
      "Error - please contact Scientific Open Solutions about this problem, error 'Survey_001'."
    );
  }
});

//by qwerty at https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 === "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};

/*
 * Functions
 */

function clean_item(this_item) {
  if ((this_item.indexOf("'") !== -1) | (this_item.indexOf('"') !== -1)) {
    appropriate_message(
      "Please avoid apostraphes or quote marks in the responses the participant can give. These cause problems with smooth running of surveys. This occurs when you wrote:<br><br>" +
        this_item
    );
  }
  return this_item;
}

function generate_feedback_string(
  feedback_array,
  this_index,
  feedback_color,
  row
) {
  if (feedback_array) {
    if (feedback_array.length > 1) {
      return $("<div>")
        .addClass(
          "feedback_span_multiple" +
            row["item_name"].toLowerCase() +
            "_feedback"
        )
        .html(feedback_array[this_index])[0].outerHTML;
    } else {
      return $("<div>")
        .addClass(
          "feedback_span_single " + row["item_name"].toLowerCase() + "_feedback"
        )
        .css("color", feedback_color[this_index])
        .html(feedback_array[this_index])[0].outerHTML;
    }
  } else {
    return "";
  }
}

function get_feedback(row) {
  if (typeof row["feedback"] !== "undefined" && row["feedback"] !== "") {
    feedback_array = row["feedback"].split("|");
    if (typeof row["feedback_color"] === "undefined") {
      appropriate_message(
        "The color for the feedback options has not been set. If you created this questionnaire, please add a column 'feedback_color' to your survey and separate the colors by a pipe (|) character."
      );
    }
    feedback_color = row["feedback_color"].split("|");
  } else {
    feedback_array = null;
    feedback_color = "";
  }
  return [feedback_array, feedback_color];
}

function isJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

survey_js.likert_update = function (this_element) {
  [row_no, item_name] = retrieve_row_no_item_name(this_element);
  $(".row_" + row_no)
    .removeClass("active")
    .removeClass("btn-primary")
    .addClass("btn-outline-primary");
  $(this_element).removeClass("btn-outline-primary").addClass("btn-primary");
  $("#survey_" + item_name + "_response").val(this_element.innerHTML);
  $("#survey_" + item_name + "_value").val(this_element.value);

  response_check(this_element);
};

function load_survey(survey, survey_outline) {
  /*
   * are we in preview?
   */
  if (typeof survey === "object") {
    survey_content = survey;
  } else if (typeof parent.collector_survey_preview !== "undefined") {
    survey_content = survey;
  } else if (
    typeof parent.master !== "undefined" &&
    parent.master.surveys.preview
  ) {
    survey_content = survey;
    survey_obj.phasetypes = parent.master.phasetypes.user;
  } else {
    survey = survey.toLowerCase().replace(".csv", "") + ".csv";

    if (
      typeof parent.parent.project_json.surveys !== "undefined" &&
      typeof parent.parent.project_json.surveys[survey] !== "undefined"
    ) {
      survey_content = parent.parent.project_json.surveys[survey];
      survey_obj.phasetypes = parent.parent.project_json.phasetypes;
    } else if (
      typeof parent.parent.project_json.surveys !== "undefined" &&
      typeof parent.parent.project_json.surveys[survey.replace(".csv", "")]
    ) {
      survey_content =
        parent.parent.project_json.surveys[survey.replace(".csv", "")];
      survey_obj.phasetypes = parent.parent.project_json.phasetypes;
    } else {
      appropriate_message("Survey " + survey + " doesn't appear to exist");
    }
  }
  process_returned_questionnaire(survey_content, survey_outline);
}

function process_question(row, row_no) {
  //row.values = row.values == "" ? row.answers : row.values;
  if (row_check("page_break", row)) {
    page_break_management.breaks_remaining++;
    question_td =
      "</tr></table><table id='table" +
      page_break_management.breaks_remaining +
      "' style='display:none' class='table_break'></tr>";
  } else {
    if (
      (typeof row["values"] !== "undefined") &
      (typeof row["values"] !== "function")
    ) {
      //to address microsoft edge issue.
      value_array = row["values"].split("|");
    } else {
      value_array = "";
    }

    if (row["item_name"].indexOf(" ") !== -1) {
      appropriate_message(
        "Please note that the 'item name' '" +
          row["item_name"] +
          "' is invalid because it has at least one space. Please use underscores instead of spaces. If you're not the creator of this task, please contact the person who created it."
      );
    }

    /*
     * class for scoring
     */

    var this_class = "";
    for (var i = 0; i < scoring_object.scales.length; i++) {
      if (row[scoring_object.scales[i].toLowerCase()] === "1") {
        this_class +=
          scoring_object.scales[i]
            .toLowerCase()
            .replace("score: ", "")
            .replace(/ |-/, "") + " ";
      }
      if (row[scoring_object.scales[i].toLowerCase()] === "r1") {
        this_class +=
          scoring_object.scales[i]
            .toLowerCase()
            .replace("score: ", "")
            .replace(" ", "_") + "-r1 ";
      }
    }

    /*
     * adding to row to help with "write" function
     */
    var row_x = JSON.parse(JSON.stringify(row));
    row_x["row_no"] = row_no;
    row_x["this_class"] = this_class;

    [feedback_array, feedback_color] = get_feedback(row);

    var survey_id = "survey_" + row["item_name"].toLowerCase();

    question_td =
      $("<input>")
        .attr("type", "hidden")
        .addClass("response_element")
        .addClass("row_" + row_no)
        .prop("id", survey_id + "_response")
        .prop("name", survey_id + "_response")
        .val("")[0].outerHTML +
      $("<input>")
        .attr("type", "hidden")
        .prop("id", survey_id + "_value")
        .prop("name", survey_id + "_value")
        .val("")[0].outerHTML;

    /*
     * Survey settings
     */
    [row_ques_perc, row_resp_perc] = row_perc(row["question_width"]);

    if (typeof settings.feedback_before_response === "undefined") {
      settings.feedback_before_response = true;
    }

    if (typeof settings.lock_after_feedback === "undefined") {
      settings.lock_after_feedback = false;
    }

    if (typeof row["type"] === "undefined") {
      return false;
    }

    switch (row["type"].toLowerCase()) {
      case "page_start":
        //var tabs_html = $("#survey_tabs").html();
        if (settings.tab_hor_vert === "horizontal") {
          span_div = "span";
        } else if (settings.tab_hor_vert === "vertical") {
          span_div = "div";
        }
        if (typeof survey_obj.tabs === "undefined") {
          survey_obj.tabs = 0;
        } else {
          survey_obj.tabs++;
        }
        if (survey_obj.tabs === 0) {
          //i.e. is the first tab
          active_button = "btn-outline-primary active";
        } else {
          active_button = "btn-secondary disabled";
        }
        if (settings.tab_hor_vert === "vertical") {
          var vert_btn_block = "btn-block";
        } else {
          var vert_btn_block = "";
        }
        $("#survey_tabs").append(
          $("<" + span_div + ">")
            .addClass("btn-group-toggle")
            .attr("data-toggle", "buttons")
            .append(
              $("<label>")
                .addClass("btn")
                .addClass("show_tab")
                .html(row["text"])
                .prop("id", "tab_" + survey_obj.tabs + "_button")
                .append(
                  $("<input>")
                    .attr("autocomplete", "off")
                    .attr("checked", true)
                    .attr("type", "checkbox")
                )
            )[0].outerHTML
        );

        page_break_indexes = [];
        survey_obj.data.forEach(function (row, this_index) {
          if (
            typeof row.type !== "undefined" &&
            row.type.toLowerCase() === "page_start"
          ) {
            page_break_indexes.push(this_index);
          }
        });

        if (survey_obj.tabs > 0) {
          question_td
            .append(
              $("<div>")
                .addClass("survey_page")
                .css("display", "none")
                .prop("id", "tab_" + survey_obj.tabs)
            )
            .append(
              $("<table>")
                .addClass("table_break")
                .prop("id", "table_" + survey_obj.tabs)
                .append("<tr>")
            );
        } else {
          question_td
            .append(
              $("<div>")
                .addClass("survey_page")
                .prop("id", "tab_" + survey_obj.tabs)
            )
            .append(
              $("<table>")
                .addClass("table_break")
                .prop("id", "table_" + survey_obj.tabs)
                .append("<tr>")
            );
        }
        break;
      case "checkbox":
      case "checkbox_vertical":
        question_td += write("checkbox_vertical", row_x);
        break;
      case "checkbox_horizontal":
        question_td += write("checkbox_horizontal", row_x);
        break;
      case "checkbox_single":
        question_td += write("checkbox_single", row_x);
        break;
      case "date":
        question_td += write("date", row_x);
        break;
      case "dropdown":
      case "select":
        question_td += write("dropdown", row_x);
        break;
      case "email":
        question_td += write("email", row_x);
        break;
      case "google_slide":
      case "jumbled":
      case "instruct":
        // these are defined elsewhere to take the whole row
        break;
      case "likert":
        question_td += write("likert", row_x);
        break;
      case "number":
        question_td += write("number", row_x);
        break;
      case "para":
        question_td += write("para", row_x);
        break;
      case "radio":
      case "radio_vertical":
        question_td += write("radio_vertical", row_x);
        break;
      case "radio_horizontal":
        question_td += write("radio_horizontal", row_x);
        break;

      case "report_score":
        question_td.append(
          $("<input>")
            .addClass("form-control")
            .addClass("score_" + row["item_name"])
            .addClass(row["item_name"] + "_item")
            .addClass("row_" + row_no)
            .attr("disabled", true)
            .attr("type", "text")
            .prop("name", "survey_" + row["item_name"].toLowerCase())
        );
        break;

      case "text":
        question_td += write("text", row_x);
        break;
      default:
        /*
         * Load from the user's phasetype
         */

        question_td += phasetype_obj[row.type];

        break;
    }

    if (feedback_array) {
      question_td.append(
        $("<button>")
          .addClass("btn")
          .addClass("btn-outline-info")
          .addClass("feedback_btn")
          .addClass(row["item_name"] + "_item")
          .addClass("row_" + row_no)
          .html("Show")
          .on("click", function () {
            reveal_answers(this);
          })
          .prop("id", "reveal_" + row["item_name"].toLowerCase() + "_feedback")
      );
    }
  }
  if (typeof row["type"] === "undefined") {
    return "";
  } else {
    if (row["type"].toLowerCase() === "instruct") {
      row_html = write("instruct", row);
    } else if (row["type"].toLowerCase() === "jumbled") {
      //row_html  = question_td + write("jumbled",row); <-- this is better, but being paused for placement work Anthony is doing
      row_html = write("jumbled", row);
    } else if (row["type"].toLowerCase() === "likert") {
      if (
        typeof row["side_by_side"] !== "undefined" &&
        row["side_by_side"].toLowerCase() === "yes"
      ) {
        var row_html =
          $("<td>")
            .addClass("text-primary")
            .css("text-align", "right")
            .css("width", row_ques_perc)
            .html(row["text"])
            .prop(
              "id",
              "survey_" +
                row["item_name"].toLowerCase().replace(" ", "_") +
                "_question"
            )[0].outerHTML + $("<td>").html(question_td)[0].outerHTML;
      } else {
        var row_html =
          $("<tr>").append($("<td>").attr("colspan", 2).html(row["text"]))[0]
            .outerHTML +
          $("<tr>").append(
            $("<td>")
              .attr("colspan", 2)
              .attr("align", "center")
              .html(question_td)
          )[0].outerHTML;
      }
    } else if (row["type"].toLowerCase() === "google_slide") {
      var row_html = $("<td>")
        .attr("colspan", 2)
        .html(row["text"])[0].outerHTML;

      //var row_html="<td colspan='2'>"+row["text"]+"</label></td>";
    } else if (
      typeof row["no_text"] !== "undefined" &&
      row["no_text"] === "on"
    ) {
      var row_html = $("<td>")
        .attr("colspan", 2)
        .html(question_td)[0].outerHTML;

      //var row_html="<td colspan='2'>"+question_td+"</td>";
    } else {
      if (
        (row["text"].toLowerCase() === "page_start") |
        (row["type"].toLowerCase() === "page_start")
      ) {
        row_html = question_td;
      } else {
        var row_html =
          $("<td>")
            .addClass("text-primary")
            .css("text-align", "right")
            .css("width", row_ques_perc)
            .html(row["text"])
            .prop(
              "id",
              "survey_" +
                row["item_name"].toLowerCase().replace(" ", "_") +
                "_question"
            )[0].outerHTML + $("<td>").html(question_td)[0].outerHTML;
      }
    }
    if (typeof row["optional"] !== "undefined") {
      if (row["optional"].toLowerCase() === "no") {
        proceed_object.name.push(row["item_name"]);
        proceed_object.type.push(row["type"]);
        proceed_object.break_no.push(page_break_management.breaks_remaining);
      }
    }
    if (
      typeof row["shuffle_question"] === "undefined" ||
      row["shuffle_question"].toLowerCase() === "off"
    ) {
      this_shuffle = "none";
    } else {
      this_shuffle = row["shuffle_question"];
    }
    return [row_html, this_shuffle];
  }
}

function process_score(
  row_no,
  values_col,
  this_response,
  item,
  values_reverse
) {
  item_values = survey_obj.data[row_no][values_col].split("|");
  if (typeof values_reverse !== "undefined" && values_reverse === "r") {
    item_values.reverse();
  }
  item_answers = survey_obj.data[row_no]["values"].split("|");
  var this_value = item_values[item_answers.indexOf(this_response)];
  $("#survey_" + item + "_score").val(this_value);
  if (typeof this_value !== "undefined") {
    return parseFloat(this_value);
  }
}

function process_returned_questionnaire(data, survey_outline) {
  /*
   * trim the data if it has a blank final row
   */
  if (data[data.length - 1].length < data[0].length) {
    data.pop();
  }
  survey_obj.data = data;
  survey_obj.data = Papa.unparse(survey_obj.data);
  survey_obj.data = parent.parent.Collector.PapaParsed(survey_obj.data);

  /*
   * detect if there are phasetypes that need to be loaded
   */

  var phasetypes = survey_obj.data.filter(function (row) {
    return types_list.indexOf(row.type.toLowerCase()) === -1;
  });

  function load_phasetypes(phasetypes) {
    if (phasetypes.length > 0) {
      var phasetype = phasetypes.pop().type;

      $.get(
        home_dir + "/User/PhaseTypes/" + phasetype + ".html",
        function (this_html) {
          this_html = this_html.replaceAll("../User/", home_dir + "/User/");

          phasetype_obj[phasetype] = this_html;
          load_phasetypes(phasetypes);
        }
      );
    } else {
      survey_obj.scales = {};
      var col_headers = Object.keys(survey_obj.data[0]);
      col_headers.forEach(function (header) {
        if (header.indexOf("score:") === 0) {
          var original_header = header;
          header = header.replace("score: ", "");
          header = header.replace("score:", "");
          survey_obj.scales[header] = {};
          survey_obj.scales[header].questions = {};

          for (var i = 1; i < survey_obj.data.length; i++) {
            row = survey_obj.data[i];
            if (
              row[original_header] !== "" &&
              typeof row[original_header] !== "undefined"
            ) {
              survey_obj.scales[header].questions[i] = row[original_header];
            }
          }
        }
      });
      write_survey(survey_obj.data, survey_outline);
      $("#please_wait_div").hide();
      $("#proceed_button").show();
      $("html, body").animate(
        {
          scrollTop: $("#" + survey_outline).offset().top,
        },
        1000
      );
    }
  }
  load_phasetypes(phasetypes);
}

function row_perc(this_rat) {
  if (typeof this_rat === "undefined") {
    row_resp_perc = "50%";
    row_ques_perc = "50%";
  } else {
    row_resp_perc = parseFloat(100 - this_rat.replace("%", "")) + "%";
    row_ques_perc = parseFloat(this_rat.replace("%", "")) + "%";
  }
  return [row_ques_perc, row_resp_perc];
}

function response_check(submitted_element) {
  switch (submitted_element.type) {
    case "checkbox":
      var checked_responses = $(
        "[name='" + submitted_element.name + "']:checked"
      );
      if (checked_responses.length) {
        //i.e. more than 0
        var values = [];
        for (var i = 0; i < checked_responses.length; i++) {
          values.push(checked_responses[i].value);
        }
        $("#" + submitted_element.name + "_response").val(
          JSON.stringify(values)
        );
      } else {
        $("#" + submitted_element.name + "_response").val("");
      }
      break;

    case "button":
      $("#" + submitted_element.name + "_response").val(
        submitted_element.value
      );
      break;

    case "number":
    case "radio":
    case "select-one":
    case "text":
    case "textarea":
      $("#" + submitted_element.name + "_response").val(
        submitted_element.value
      );
      break;
  }
  update_score();
}

function retrieve_row_no_item_name(this_element) {
  var these_classes = this_element.className.split(" ");
  var row_no;
  var item_name;
  these_classes.forEach(function (this_class) {
    if (this_class.indexOf("row_") > -1) {
      row_no = this_class.replace("row_", "");
    }
    if (this_class.indexOf("_item") > -1) {
      item_name = this_class.replace("_item", "").toLowerCase();
    }
  });
  return [row_no, item_name];
}

function reveal_answers(this_element) {
  var this_response = $(
    "#" +
      this_element.id
        .replace("reveal_", "survey_")
        .replace("_feedback", "_response")
  ).val();
  response_present = this_response === "" ? false : true;

  if (
    settings.feedback_before_response === false &&
    response_present === false
  ) {
    appropriate_message("Please respond before trying reveal the feedback.");
  } else {
    if ($("#" + this_element.id).hasClass("btn-outline-info")) {
      $("." + this_element.id.replace("reveal_", "")).show(500);
      if (settings.lock_after_feedback) {
        var item_class = this_element.id
          .replace("_feedback", "_item")
          .replace("reveal_", "");
        $("." + item_class).prop("disabled", true);
        document.getElementsByClassName(item_class).title =
          "The person creating this content has set it so that your answers are locked in once you have chosen to see the feedback";
        $("#" + this_element.id)
          .addClass("btn-info")
          .removeClass("btn-outline-info")
          .html("Locked");
        document.getElementById(this_element.id).title =
          "The person creating this content has set it so that your answers are locked in once you have chosen to see the feedback";
        $("#" + this_element.id).addClass("disabled");
      } else {
        $("#" + this_element.id)
          .html("Hide")
          .removeClass("btn-outline-info")
          .addClass("btn-info");
      }
    } else {
      $("." + this_element.id.replace("reveal_", "")).hide(500);
      $("#" + this_element.id)
        .html("Show")
        .addClass("btn-outline-info")
        .removeClass("btn-info");
    }
  }
}

function row_check(type, row) {
  if ((type = "page_break")) {
    return (
      typeof row["text"] !== "undefined" &&
      typeof row["type"] !== "undefined" &&
      (row["text"].toLowerCase() === "page_break") |
        (row["type"].toLowerCase() === "page_break")
    );
  } else if ((type = "")) {
    //do nothing
  }
}

// http://stackoverflow.com/questions/962802#962890
function shuffle(array) {
  var tmp,
    current,
    top = array.length;
  if (top)
    while (--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }
  return array;
}

function shuffle_answers(row) {
  if (
    typeof row["shuffle_answers"] !== "undefined" &&
    row["shuffle_answers"].toLowerCase() === "yes"
  ) {
    var answers = row["answers"].split("|");
    order = shuffle([...Array(answers.length).keys()]);

    var ordered_answers = order.map(function (position) {
      return answers[position];
    });
    row["answers"] = ordered_answers.join("|");

    if (row["values"].indexOf("|") !== -1) {
      var values = row["values"].split("|");
      var ordered_values = order.map(function (position) {
        return values[position];
      });
      row["values"] = ordered_values.join("|");
    }
  }
  return row;
}

function update_score() {
  var scales = Object.keys(survey_obj.scales);
  scales.forEach(function (scale) {
    this_scale = survey_obj.scales[scale];
    var questions = Object.keys(this_scale.questions);
    var this_score = 0;
    complete_score = true;

    questions.forEach(function (row_no) {
      var item = survey_obj.data[row_no].item_name.toLowerCase();
      var this_response = $("#survey_" + item + "_value").val();
      var normal_reverse = this_scale.questions[row_no];

      if (normal_reverse.indexOf("-") === -1) {
        var multiplier = parseFloat(normal_reverse.replace("r", ""));
        if (normal_reverse.indexOf("r") === 0) {
          //reverse the values

          this_value = process_score(
            row_no,
            "values",
            this_response,
            item,
            "r"
          );
        } else {
          this_value = process_score(row_no, "values", this_response, item);
        }
      } else {
        values_reverse = normal_reverse.split("-");
        values_col = values_reverse[0].toLowerCase();
        normal_reverse = values_reverse[1];
        var multiplier = parseFloat(normal_reverse.replace("r", ""));

        if (normal_reverse.indexOf("r") === 0) {
          //reverse the values
          this_value = process_score(
            row_no,
            values_col,
            this_response,
            item,
            "r"
          );
        } else {
          this_value = process_score(row_no, values_col, this_response, item);
        }
      }
      if (typeof this_value !== "undefined") {
        this_score += multiplier * this_value;
      } else {
        complete_score = false;
      }
    });
    if (complete_score) {
      $(".score_" + scale)
        .addClass("bg-success")
        .removeClass("bg-danger")
        .addClass("text-light")
        .prop("title", "All relevant questions have been answered");
    } else {
      $(".score_" + scale)
        .removeClass("text-success")
        .addClass("bg-danger")
        .addClass("text-light")
        .prop("title", "At least one relevant questions has NOT been answered");
    }
    $(".score_" + scale).val(this_score);
  });
}

function write(type, row) {
  var this_html = "";
  [feedback_array, feedback_color] = get_feedback(row);
  row = shuffle_answers(row);
  row["item_name"] = row["item_name"].toLowerCase();

  if (type === "checkbox_horizontal") {
    var options = row["answers"].split("|");
    var this_table = $("<table>");
    this_row = this_table[0].insertRow();
    for (var i = 0; i < options.length; i++) {
      var this_cell = this_row.insertCell();
      var this_div = $("<div>");
      this_div.addClass("custom-control");
      this_div.addClass("custom-checkbox");
      var this_input = $("<input>");
      this_input[0].type = "checkbox";
      this_input[0].id = row["item_name"] + i;
      this_input[0].name = "survey_" + row["item_name"];
      this_input
        .addClass("custom-control-input")
        .addClass("response")
        .addClass(row["this_class"])
        .addClass(row["custom-control"])
        .addClass(row["custom-checkbox"])
        .addClass(row["item_name"] + "_item")
        .addClass("row_" + row["row_no"]);
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label[0].innerText = options[i];
      this_label.addClass("custom-control-label");
      this_div.append(this_input).append(this_label);
      this_cell.innerHTML = this_div[0].outerHTML;
    }

    this_html += this_table[0].outerHTML;
  } else if (type === "checkbox_single") {
    var this_div = $("<div>");
    this_div.attr("data-toggle", "buttons");
    this_div.addClass("btn-group-toggle");
    var this_label = $("<label>");
    this_label.addClass("btn");
    this_label.addClass("btn-outline-primary");
    this_label.html(row["answers"]);
    var this_checkbox = $("<input>");
    this_checkbox[0].id = row["item_name"];
    this_checkbox[0].name = "survey_" + row["item_name"].toLowerCase();
    this_checkbox[0].type = "checkbox";
    this_checkbox.attr("checked", true);
    this_checkbox
      .addClass("response")
      .addClass(row["item_name"] + "_item row_" + row["row_no"]);
    this_div.append(this_label);
    this_label.append(this_checkbox);
    this_html += this_div[0].outerHTML;
  } else if (type === "checkbox_vertical") {
    var options = row["answers"].split("|");
    var values = row["values"].split("|");
    for (var i = 0; i < options.length; i++) {
      feedback_string = generate_feedback_string(
        feedback_array,
        i,
        feedback_color,
        row
      );
      var this_div = $("<div>");
      this_div.addClass("custom-control").addClass("custom-checkbox");
      var this_checkbox = $("<input>");
      this_checkbox[0].id = row["item_name"] + i;
      this_checkbox[0].value = options[i];
      this_checkbox[0].type = "checkbox";
      this_checkbox[0].name = "survey_" + row["item_name"].toLowerCase();
      this_checkbox
        .addClass("custom-control-input")
        .addClass(row["this_class"])
        .addClass("custom-control")
        .addClass("custom-checkbox")
        .addClass("response")
        .addClass(row["item_name"] + "_item_row");
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label[0].innerHTML = options[i];
      this_label.addClass("custom-control-label");
      this_div.append(this_checkbox).append(this_label);

      this_html += this_div[0].outerHTML;
    }
    if (
      typeof row["other"] !== "undefined" &&
      row["other"].toLowerCase() === "yes"
    ) {
      var this_div = $("<div>");
      this_div.addClass("custom-control").addClass("custom-checkbox");
      var this_checkbox = $("<input>");
      this_checkbox[0].id = row["item_name"] + "_other";
      this_checkbox[0].value = "Other";
      this_checkbox[0].type = "checkbox";
      this_checkbox[0].name = "survey_" + row["item_name"].toLowerCase();
      this_checkbox
        .addClass("custom-control-input")
        .addClass(row["this_class"])
        .addClass("custom-control")
        .addClass("custom-checkbox")
        .addClass("response")
        .addClass(row["item_name"] + "_item_row");
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + "_other";
      this_label[0].innerHTML = "Other";
      this_label.addClass("custom-control-label");
      this_div.append(this_checkbox).append(this_label);

      this_html += this_div[0].outerHTML;

      var text_input = $("<input>");
      text_input.addClass("form-control");
      text_input.attr(
        "placeholder",
        "(Please specify if you selected 'Other')"
      );
      text_input[0].name =
        "survey_" + row["item_name"].toLowerCase() + "_other";
      this_html += text_input[0].outerHTML;
    }
  } else if (type === "date") {
    var input = $("<input>");
    input
      .addClass("response")
      .addClass("custom-control")
      .addClass("datepicker")
      .addClass("date")
      .addClass(row["item_name"] + "_item")
      .addClass("row_" + row["row_no"])
      .attr("name", "survey_" + row["item_name"])
      .attr("type", "text");
  } else if (type === "dropdown") {
    var options = row["answers"].split("|");
    var this_dropdown = $("<select>");
    this_dropdown
      .addClass("form-select")
      .addClass("response")
      .addClass("txt-primary")
      .addClass(row["item_name"] + "_item")
      .addClass("row_" + row["row_no"])
      .addClass("collector_button")
      .attr("name", "survey_" + row["item_name"])
      .css("margin", "0px")
      .css("width", "auto");

    /* this will be necessary to tidy up jumbled sentences
  if(typeof(row["item_name_old"]) !== "undefined"){
    this_dropdown.addClass(row["item_name_old"] + "_item");
  }
  */

    this_dropdown.append(
      "<option selected disabled hidden>-- no option selected --</option>"
    );
    options.forEach(function (this_option) {
      this_dropdown.append("<option>" + this_option + "</option>");
    });
    var this_html = this_dropdown[0].outerHTML;
  } else if (type === "email") {
    var this_input = $("<input>");
    this_input
      .addClass("form-control")
      .addClass("response")
      .addClass(row["item_name"] + "_item row_" + row["row_no"])
      .attr("type", "email")
      .attr("name", "survey_" + row["item_name"]);
  } else if (type === "instruct") {
    this_html += "<td colspan='2'>" + row["text"] + "</td>";
  } else if (type === "jumbled") {
    var this_td = $("<td>");
    this_td.attr("colspan", 2);

    var this_div = $("<div>");
    this_div
      .addClass("form-inline")
      .addClass("bg-secondary")
      .addClass("text-white")
      .css("width", "100%")
      .css("padding", "20px")
      .css("margin", "20px")
      .css("border-radius", "5px");

    var question = row["text"].split("|");
    questions_html = question
      .map(function (text, index) {
        if (index === question.length - 1) {
          return text;
        } else {
          var row_x = row;
          row_x["item_name_old"] = row_x["item_name"];
          row_x["item_name"] = row_x["item_name"] + "_" + index;
          var row_html =
            text +
            write("dropdown", row_x).replace("margin: 0px", "margin: 5px");
          row_x["item_name"] = row_x["item_name_old"];
          return row_html;
        }
      })
      .join("");

    this_td.append(this_div);
    this_div.append(questions_html);

    this_html = this_td[0].outerHTML;
  } else if (type === "likert") {
    // set styles
    if (typeof row["btn_width"] === "undefined") {
      row["btn_width"] = "auto";
    }
    if (typeof row["side_width"] === "undefined") {
      var side_width = "auto";
    }

    // create and build these elements
    var this_div = $("<div>");
    if (typeof row["side_text"] !== "undefined" && row["side_text"] !== "") {
      side_text = row["side_text"].split("|");
      side_text = side_text.map(function (this_side) {
        var this_span = $("<span>");
        this_span
          .css("width", side_width)
          .css("padding", "20px")
          .addClass("text-primary")
          .html("<b>" + this_side + "</b>");
        return this_span[0].outerHTML;
      });
    } else {
      side_text = ["", ""];
    }

    this_div
      .addClass("btn-group")
      .addClass("btn-group-toggle")
      .append(side_text[0])
      .attr("data-togle", "buttons");

    var options = row["answers"].split("|");
    var values = row["values"].split("|");
    for (var i = 0; i < options.length; i++) {
      var this_button = $("<button>");
      this_button
        .attr("autocomplete", "off")
        .attr("id", "likert_" + row["row_no"] + "_" + i)
        .attr("onclick", "survey_js.likert_update(this)")
        .attr("value", values[i])
        .addClass("btn")
        .addClass("btn-outline-primary")
        .addClass("survey_btn")
        .addClass(row["item_name"] + "_item row_" + row["row_no"])
        .css("width", row["btn_width"])
        .html(clean_item(options[i]));
      this_div.append(this_button);
    }
    this_div.append(side_text[1]);
    this_html += this_div[0].outerHTML;
  } else if (type === "number") {
    var this_input = $("<input>");
    this_input[0].type = "number";
    this_input[0].name = "survey_" + row["item_name"];
    this_input
      .addClass("response")
      .addClass("form-control")
      .addClass(row["item_name"] + "_item row_" + row["row_no"]);
    this_html += this_input[0].outerHTML;
  } else if (type === "para") {
    var this_textarea = $("<textarea>");
    this_textarea[0].name = "survey_" + row["item_name"];
    this_textarea
      .addClass(row["item_name"] + "_item row_" + row["row_no"])
      .addClass("response");
    this_textarea.css("width", "100%").css("height", "200px");
    this_html += this_textarea[0].outerHTML;
  } else if (type === "radio_horizontal") {
    var options = row["answers"].split("|");
    var this_table = $("<table>");
    this_row = this_table[0].insertRow();
    for (var i = 0; i < options.length; i++) {
      var this_cell = this_row.insertCell();
      var this_div = $("<div>");
      this_div.addClass("custom-control");
      this_div.addClass("custom-radio");
      var this_input = $("<input>");
      this_input[0].type = "radio";
      this_input[0].id = row["item_name"] + i;
      this_input[0].name = "survey_" + row["item_name"];
      this_input
        .addClass("custom-control-input")
        .addClass("response")
        .addClass(row["this_class"])
        .addClass(row["custom-control"])
        .addClass(row["custom-radio"])
        .addClass(row["item_name"] + "_item")
        .addClass("row_" + row["row_no"]);
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label[0].innerText = options[i];
      this_label.addClass("custom-control-label");
      this_div.append(this_input).append(this_label);
      this_cell.innerHTML = this_div[0].outerHTML;
    }
    this_html += this_table[0].outerHTML;
  } else if (type === "radio_vertical") {
    var options = row["answers"].split("|");
    var values = row["values"].split("|");
    for (var i = 0; i < options.length; i++) {
      feedback_string = generate_feedback_string(
        feedback_array,
        i,
        feedback_color,
        row
      );
      var this_div = $("<div>");
      this_div.addClass("custom-control").addClass("custom-radio");
      var this_input = $("<input>");
      this_input[0].type = "radio";
      this_input[0].id = row["item_name"] + i;
      this_input[0].value = options[i];
      this_input[0].name = "survey_" + row["item_name"];
      this_input
        .addClass("custom-control-input")
        .addClass(row["this_class"])
        .addClass("custom-control")
        .addClass("custom-radio")
        .addClass("response")
        .addClass(row["item_name"] + "_item_row_" + row["row_no"]);
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label.addClass("custom-control-label");
      this_label.html(options[i]);
      this_div.append(this_input).append(this_label).append(feedback_string);
      this_html += this_div[0].outerHTML;
    }
  } else if (type === "text") {
    var this_input = $("<input>");
    this_input[0].type = "text";
    this_input[0].name = "survey_" + row["item_name"];
    this_input
      .addClass("form-control")
      .addClass(row["item_name"] + "_item row_" + row["row_no"])
      .addClass("response");
    this_html += this_input[0].outerHTML;
  }

  switch (type) {
    case "checkbox_vertical":
    case "radio_vertical":
      // do nothing
      break;
    default:
      this_html += generate_feedback_string(
        feedback_array,
        0,
        feedback_color,
        row
      );
      break;
  }

  return this_html;
}

function write_survey(this_survey, this_id) {
  scoring_object.update_scales(this_survey);
  survey_html = "<table class='table_break' id='table0'>";
  this_survey_object = {
    content: [],
    shuffle_question: [],
    content_new_order: [],
    shuffled_content: [],
    shuffled_arrays: {},
  };

  survey_html += "<tr>";
  for (i = 0; i < this_survey.length; i++) {
    row = this_survey[i];
    row_html = process_question(row, i);
    this_survey_object.content.push(row_html[0]);
    this_survey_object.shuffle_question.push(row_html[1]);
  }

  unique_shuffles = this_survey_object.shuffle_question.filter(
    (v, i, a) => a.indexOf(v) === i
  ); //by Camilo Martin on https://stackoverflow.com/questions/1960473/unique-values-in-an-array

  for (var i = 0; i < unique_shuffles.length; i++) {
    if (
      typeof unique_shuffles[i] !== "undefined" &&
      unique_shuffles[i] !== "none" &&
      unique_shuffles[i] !== ""
    ) {
      shuffled_content = this_survey_object.shuffle_question
        .map(function (element, index) {
          if (
            typeof element !== "undefined" &&
            element.toLowerCase() !== "none" &&
            element.toLowerCase() === unique_shuffles[i]
          ) {
            return this_survey_object.content[index];
          }
        })
        .filter((elm) => typeof elm !== "undefined");
      new_order = shuffle(shuffled_content);
      this_survey_object.shuffled_arrays[unique_shuffles[i]] = new_order; // add new array with dynamic name
    }
  }

  for (var i = 0; i < this_survey_object.content.length; i++) {
    var this_index = Object.keys(this_survey_object.shuffled_arrays).indexOf(
      this_survey_object.shuffle_question[i]
    );
    if (this_index !== -1) {
      //take first item off relevant list and delete item
      var this_item =
        this_survey_object.shuffled_arrays[
          Object.keys(this_survey_object.shuffled_arrays)[this_index]
        ].shift();
      this_survey_object.content_new_order[i] = this_item;
    } else {
      this_survey_object.content_new_order[i] = this_survey_object.content[i];
    }
  }

  qs_in_order = this_survey_object.content_new_order.join("</tr><tr>");
  qs_in_order += "</tr>";

  survey_html += qs_in_order;
  survey_html += "</table>";

  $("#" + this_id).html(survey_html);

  $(".response").on("change", function () {
    response_check(this);
  });

  $("#" + this_id).show(1000); //scroll to top

  $(".show_tab").on("click", function () {
    if (this.className.indexOf("disabled") === -1) {
      $(".show_tab").removeClass("active");
      $(".survey_page").hide();
      $("#" + this.id.replace("_button", "")).show();
    } else {
      appropriate_message(
        "You have not yet unlocked this tab - maybe try clicking on <b>Proceed</b>?"
      );
    }
  });
}
/*
 * exports for testing
 */
if (typeof module !== "undefined") {
  module.exports = {
    load_survey: load_survey,
    likert_update: survey_js.likert_update,
  };
} else {
  if (typeof Phase !== "undefined") {
    Phase.set_timer(function () {
      load_survey(current_survey, "survey_outline");
    }, 100);
  } else {
    load_survey(current_survey, "survey_outline");
  }
}
