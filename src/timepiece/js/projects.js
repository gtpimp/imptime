imp.projects = imp.projects || {};

imp.projects.already_loaded_sprints = {};


var numbers_state = { 'all':0, 'no ctc':1, 'no money':2, 'no money and no estimates':3 };
imp.show_numbers_state = numbers_state['all'];

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
        loading_indicators.show();

        var joined_ordered_ids = ordered_ids.join(',');
        var response = $.ajax({type:"POST",
                               url: url,
                               data: { ordered_ids:joined_ordered_ids, project_id:project_id },
                               dataType:"json",
                               success : function () {
                                   loading_indicators.hide();
                               }
                              });
    };
    return ret_func;
};

imp.projects.show_project_card_as_popup = function (event, project_card_url, msg, args) {
    imp.show_issue_detail(null, project_card_url, msg, args);
    event.stopPropagation();
    return false;
};

imp.projects._make_load_for_data = function ( done_data_function_handler ) {
    var _done_data_function_handler = done_data_function_handler;

    return function( element, expand_url) {
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

        var loading = area_to_insert.find(".loading");
        if (area_to_insert.find(".project_detail").length == 0) {
            loading.show();
            var response = $.ajax({ type:"GET",
                                    url: expand_url,
                                    success: function(data) {
                                        area_to_insert.append($(data));
                                        loading.hide();
                                        imp.projects.already_loaded_sprints[expand_url] = true;
					imp.on_issue_rows_loaded(area_to_insert);

                                        if (done_data_function_handler) {
                                            response.done( done_data_function_handler(element) );
                                        }

                                    }
                                  });


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

	imp.projects.attach_sortable( sortable, sortable_url );
    };
};

imp.projects.attach_sortable = function(sortable, sortable_url) {

    if ( sortable_url ) {
	sortable.sortable({ connectWith: ".issue_list_body",
                            update: imp.projects.on_sortable_changed_for_url(sortable_url),
                            receive: imp.projects.on_sortable_changed_for_url(sortable_url)
			  });
    } else {
	sortable.sortable({ connectWith: ".issue_list_body" });
    }
};

imp.projects.load_or_display_issues = imp.projects._make_load_for_data( make_data_done_function_for_element );

imp.projects.on_project_sorting_change_for_url = function ( project_sorting_url) {
    var url_to_call_when_projects_were_resorted = project_sorting_url;
    return function(event,ui) {
	var url = url_to_call_when_projects_were_resorted;
        var ul_element = ui.item.parent();
        var li_elements = ul_element.find(".project_li");
        var ordered_proj_ids = [];
        li_elements.each(function(index, elem) {
            var project_id = $(elem).attr("list_project_id");
            ordered_proj_ids.push(project_id);
        });

        var joined_ordered_ids = ordered_proj_ids.join(',');
        $.ajax({type:"POST",
                url: url,
                data: { ordered_ids:joined_ordered_ids },
                dataType:"json"
               });

    };
};

imp.attach_sprint_headings = function(sprint_heading_container) {
    $("li.project_li .project_expand").hover( function() {
						  $(this).find('img.drag_img').show();
						  $(this).find('.emacs_copy_img').show();
					      },
					      function() {
						  $(this).find('.drag_img').hide();
						  $(this).find('.emacs_copy_img').hide();
					      });
};

imp.select_text_for_emacs = function(text) {
    window.prompt("Press Ctrl+C then Enter, then paste into emacs:", text);
    return false;
};

imp.on_issue_rows_loaded = function(issue_row_container) {
    $(issue_row_container).find(".drag_img").parents("tr").hover( function() {
								      $(this).find('.drag_img').show();
								      $(this).find('.emacs_copy_img').show();
								      $(this).addClass("hovered");
								  },
								  function() {
								      $(this).find('.drag_img').hide();
								      $(this).find('.emacs_copy_img').hide();
								      $(this).removeClass("hovered");
								  });
    imp.refresh_show_numbers();
    imp.highlight_issue();
    
    imp.set_issue_checkbox_hooks(issue_row_container);
};

imp.toggle_card_menu = function (event) {
    var current_element = $(event.currentTarget);
    var menu_items = current_element.parent().find(".menu_items");
    menu_items.toggle();
    event.stopPropagation();
    return false;
};

imp.close_sprint = function(el, sprint_name, url) {
    var on_done = imp.loading("Closing sprint");
    var response = $.ajax({type:"GET",
                           url: url,
                           success: function(data) {
			       $(el).parents(".project_li").addClass("closed_project").removeClass("open_project");
			       $(el).parents("li").find(".menu_close_sprint").hide();
			       $(el).parents("li").find(".menu_reopen_sprint").show();
			       on_done();
                           }
                          });
    return false;
};

imp.reopen_sprint = function(el, sprint_name, url) {
    var on_done = imp.loading("Re-opening sprint");
    var response = $.ajax({type:"GET",
                           url: url,
                           success: function(data) {
			       $(el).parents(".project_li").addClass("open_project").removeClass("closed_project");
			       $(el).parents("li").find(".menu_close_sprint").show();
			       $(el).parents("li").find(".menu_reopen_sprint").hide();
			       on_done();
                           }
                          });
    return false;
};

imp.project_card_thinking = function(el) {
    $(el).parents(".project_card").find(".loading").show();
};

imp.popup_page = function(url) {

    if (imp.popup_dialog) {
	$(".project_card_dialog_container").find(".dialog_content").load(url);
    } else {
	$(".project_card_dialog_container").dialog( { width: 600,
						      height: 400,
						      open: function(event, ui) {
							  $(".project_card_dialog_container").find(".dialog_content").load(url);
						      }
						    });
    }
    
};

imp.popup_text = function(text) {

    if (imp.popup_dialog) {
	$(".project_card_dialog_container").find(".dialog_content")[0].innerHTML=text;
    } else {
	$(".project_card_dialog_container").dialog( { width: 600,
						      height: 400,
						      open: function(event, ui) {
							  $(".project_card_dialog_container").find(".dialog_content")[0].innerHTML=text;
						      }
						    });
    }
    
};

imp.create_chart = function(chart_info) {

    // imp.data and imp.options are defined in graph.html
    //$.plot($("#graph"), imp.data, imp.options);
    //$.plot($("#bar_graph"), imp.bar_data, imp.bar_options);
    for (var i = 0; i < chart_info.length; i++) {
        $.plot($(chart_info[i].divid), chart_info[i].data, chart_info[i].options);
    }
};

imp.create_splitter = function() {
    if ( $(".splitter").splitter ) {
	$(".splitter").css({height:$(window).height()*0.9+"px"});
	$(".splitter").splitter({sizeRight: $(window).width()*0.25});
    }
};

imp.toggle_show_colours = function() {
    $(".issue_colour_square").toggle();
};

imp.toggle_show_numbers = function() {

    imp.show_numbers_state += 1;
    if ( imp.show_numbers_state >= Object.keys(numbers_state).length ) {
	imp.show_numbers_state = numbers_state['all'];
    }
    imp.refresh_show_numbers();
};

imp.refresh_show_numbers = function() {
    if ( imp.show_numbers_state == numbers_state['all'] ) {
	$(".money_cell").show();
	$(".estimates_cell").show();
    } else if ( imp.show_numbers_state == numbers_state['no ctc'] ) {
	$(".money_cell.money_ctc").hide();
	$(".estimates_cell").show();
    } else if ( imp.show_numbers_state == numbers_state['no money'] ) {
	$(".money_cell").hide();
	$(".estimates_cell").show();
    } else if ( imp.show_numbers_state == numbers_state['no money and no estimates'] ) {
	$(".money_cell").hide();
	$(".estimates_cell").hide();
    }
};

imp.on_document_ready = function() {

    var project_sort_url = $(".project_list").attr("project_sort_url");
    $(".project_list").sortable( { update : imp.projects.on_project_sorting_change_for_url(project_sort_url) });
    var project_li_row = $(".project_li");
    project_li_row.each(function(item, project_row) {
        var elem = $(project_row);
        var expanded_row = elem.find(".project_table_cell.project_expand");
        var preloaded = expanded_row.attr("preloaded") == "true";
        if (preloaded) {
            expanded_row.trigger('click');
        }
    });

    imp.create_splitter();
    imp.attach_sprint_headings();

    $(window).on('click', function(){
    			  $('issue_edit_box').remove(); 
    });

};

$(document).ready(imp.on_document_ready);

