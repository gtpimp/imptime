var imp = imp || {};
imp.projects = imp.projects || {}

imp.projects.expand_issues = function(element, expand_url) {
    var current_row = $(element);
    // var parent = $(current_row.parent());
    var parent_table = $(current_row.closest(".project_table"));
    var project_contents = parent_table.find(".project_contents");
    var area_to_insert = project_contents.find(".information");
    area_to_insert.text("YADDA"); // 
};