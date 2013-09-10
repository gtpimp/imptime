var imp = imp || {};
imp.projects = imp.projects || {}

imp.projects.expand_issues = function(element, expand_url) {
    var current_row = $(element);
    var parent_table = $(current_row.closest(".project_table"));
    var project_contents = parent_table.find(".project_contents");
    var area_to_insert = project_contents.find(".information");

    if (area_to_insert.find(".project_detail").length == 0) {
    $.ajax({type:"GET",
            url: expand_url,
            success: function(data) {                                
                area_to_insert.append($(data))
            }
           });
    } else {
        area_to_insert.find(".project_detail").remove();
    }

};