var imp = imp || {};
imp.projects = imp.projects || {};

imp.projects.already_loaded_sprints = {};

imp.projects.on_sortable_changed_for_url = function(sortable_url) {
    var sortable_update_url = sortable_url;
    function ret_func(event, ui) {        

        var url = sortable_update_url;
        var rows = ui.item.parent().find("tr");

        var project_id = $(rows[0]).attr("project_id");
        var ordered_ids = [];
        rows.each(function(index, row) {
            var elem = $(row);
            var issue_id = elem.attr("id");
            ordered_ids.push(issue_id);
            $(".loading_issue_"+issue_id).show();
        });        

        var loading_el = null;
        if (ordered_ids.length>0) {
            loading_el = $(".loading_issue_"+ordered_ids[0]);
            loading_el.show();
        }

        var joined_ordered_ids = ordered_ids.join(',');
        $.ajax({type:"POST",
                url: url,
                data: { ordered_ids:joined_ordered_ids , project_id:project_id },
                dataType:"json",
                success: function() { 

                    for( issue_id in ordered_ids ) {
                        $(".loading_issue_"+issue_id).hide();
                    };
                }
               });
    };
    return ret_func;
}

imp.projects.load_or_display_issues = function(element, expand_url, sortable_url) {

    var current_row = $(element);
    var parent_table = $(current_row.closest(".project_table"));
    var project_contents = parent_table.find(".project_contents");
    var area_to_insert = project_contents.find(".information");
    if (area_to_insert.find(".project_detail").length > 0) {
        area_to_insert.find(".project_detail").toggle();
    }

    if ( imp.projects.already_loaded_sprints[expand_url] ) {
        //already expanded
        return;
    }
    imp.projects.already_loaded_sprints[expand_url] = true;
    
    var loading = area_to_insert.find(".loading")
    if (area_to_insert.find(".project_detail").length == 0) {
        loading.show();
        var response = $.ajax({type:"GET",
                               url: expand_url,
                               success: function(data) { area_to_insert.append($(data)); loading.hide(); }
                              });
        response.done(function (data) {
            var project_detail = area_to_insert.find(".project_detail");
            var sortable = $(area_to_insert.find(".issue_list_body"));
            sortable.sortable( {stop: imp.projects.on_sortable_changed_for_url(sortable_url) } );
        });
	

    }

};

imp.projects.on_project_sorting_change_for_url = function ( project_sorting_url) {
    var url_to_call_when_projects_were_resorted = project_sorting_url;
    return function(event,ui) {
        var url = url_to_call_when_projects_were_resorted;
        var ul_element = ui.item.parent()
        var li_elements = ul_element.find(".project_li");
        var ordered_proj_ids = []
        li_elements.each(function(index, elem) {
            project_id = $(elem).attr("list_project_id");
            ordered_proj_ids.push(project_id)
        });
        
        var joined_ordered_ids = ordered_proj_ids.join(',');
        $.ajax({type:"POST",
                url: url,
                data: { ordered_ids:joined_ordered_ids },
                dataType:"json",
                // success: function() { 

                //     for( issue_id in ordered_ids ) {
                //         $(".loading_issue_"+issue_id).hide();
                //     };
                // }
               });

    };
}

imp.on_document_ready = function() {
    // var url = $(".issue_list_body").attr("update_order_url");
    // $(".issue_list_body").sortable({ stop: imp.on_sortable_changed_for_url(url) });
    // var url = $(".project_list").attr
    var project_sort_url = $(".project_list").attr("project_sort_url");
    $(".project_list").sortable( { stop : imp.projects.on_project_sorting_change_for_url(project_sort_url) });
}
$(document).ready(imp.on_document_ready);
