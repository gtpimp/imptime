var imp = imp || {};
imp.projects = imp.projects || {};

imp.projects.already_loaded_sprints = {};

imp.projects.on_sortable_changed_for_url = function(sortable_url) {
    var _sortable_url = sortable_url;
    function ret_func(event, ui) {        
        var url = _sortable_url;
        var rows = ui.item.parent().find("tr");
        var project_id = ui.item.parent().attr('id');
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
                data: { ordered_ids:joined_ordered_ids, project_id:project_id },
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

imp.projects._make_load_for_data = function ( done_data_function_handler ) {
    var _done_data_function_handler = done_data_function_handler;
    return function(element, expand_url) {
        var done_data_function_handler = _done_data_function_handler;
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
        
        var loading = area_to_insert.find(".loading")
        if (area_to_insert.find(".project_detail").length == 0) {
            loading.show();
            var response = $.ajax({ type:"GET",
                                    url: expand_url,
                                    success: function(data) { 
                                        area_to_insert.append($(data)); 
                                        loading.hide(); 
                                        imp.projects.already_loaded_sprints[expand_url] = true;
                                    }
                                  });
            
            
            if (done_data_function_handler) {
                response.done( done_data_function_handler(element) );                
            }
            
        }
        
    };
};


function make_data_done_function_for_element(element) {
    var _element = element;
    return function (data) {
        var element = _element;
        var current_row = $(element);
        var parent_table = $(current_row.closest(".project_table"));
        var project_contents = parent_table.find(".project_contents");
        var area_to_insert = project_contents.find(".information");
        var sortable = $(area_to_insert.find(".issue_list_body"));
        var sortable_url = $(sortable).attr("update_order_url");

        sortable.sortable({ connectWith: ".issue_list_body",
                            stop: imp.projects.on_sortable_changed_for_url(sortable_url),
                            receive: imp.projects.on_sortable_changed_for_url(sortable_url),
                           });
    };
};

imp.projects.load_or_display_issues = imp.projects._make_load_for_data( make_data_done_function_for_element );


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
               });

    };
}

imp.on_document_ready = function() {
    var project_sort_url = $(".project_list").attr("project_sort_url");
    $(".project_list").sortable( { stop : imp.projects.on_project_sorting_change_for_url(project_sort_url) });
    var project_li_row = $(".project_li");
    project_li_row.each(function(item, project_row) {
        elem = $(project_row);
        expanded_row = elem.find(".project_table_cell.project_expand");
        var preloaded = expanded_row.attr("preloaded") == "true";            
        if (preloaded) {
            expanded_row.trigger('click');
        }
    });
}
$(document).ready(imp.on_document_ready);
