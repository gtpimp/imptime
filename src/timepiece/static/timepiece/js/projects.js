var imp = imp || {};
imp.projects = imp.projects || {};

imp.projects.already_loaded_sprints = {};
imp.toggle_card_menu = function (event) {
    var current_element = $(event.currentTarget);
    var menu_items = current_element.parent().find(".menu_items");
    menu_items.toggle();
    event.stopPropagation();
    return false;
};

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
        });        
        
        var loading_indicators = ui.item.parent().find(".loading_issue_indicator");
        loading_indicators.each ( function (item, elem) {
            $elem = $(elem)
            $elem.show();
        });
        
        var joined_ordered_ids = ordered_ids.join(',');
        var response = $.ajax({type:"POST",
                               url: url,
                               data: { ordered_ids:joined_ordered_ids, project_id:project_id },
                               dataType:"json",
                               success : function () {
                                   loading_indicators.each ( function (index, elem) {
                                       $elem = $(elem);
                                       $elem.hide();
                                   });
                               }
                              });        
    };
    return ret_func;
};

imp.projects.show_project_card_as_popup = function (event) {
    var current_element = $(event.currentTarget);
    var destination_dom_tag = current_element.attr("target_id");
    var project_card_url = current_element.attr("project_card_url");
    var business_id= current_element.attr("business_id");
    var project_id = current_element.attr("project_id");
    var destination = $(destination_dom_tag);
    var response = $.ajax({ type:"GET",
                            url: project_card_url,                            
                          });
    var for_data_of_response = function (destination_tag) {
        
        var _bus_id = business_id;
        var _proj_id = project_id;
        var _dest_tag = destination_tag;
        
        return function(data) { 
            var project_id = _proj_id;
            var business_id = _bus_id;
            var destination = $(_dest_tag);
            var project_card_top_level = $(document).find(".project_card_top_level");
            if (project_card_top_level.length != 0) {
                var current_project_id = project_card_top_level.attr('project_id');
                var current_business_id = project_card_top_level.attr('business_id');
                project_card_top_level.parent().remove();                
                if ((project_id === current_project_id) && (business_id === current_business_id)){
                    return false;
                }
            }
            
            destination.append($(data)); 
            destination.css("background-color","whitesmoke");
            destination.css("position","fixed");
            destination.css("z-index","300");
            destination.draggable();
        }
    };
        
    response.done(  for_data_of_response(destination_dom_tag)  );
    event.stopPropagation();
    return false;
};

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
    $(".issue_pane").draggable();
}
$(document).ready(imp.on_document_ready);
