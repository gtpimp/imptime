imp.projects = imp.projects || {};

imp.projects.already_loaded_sprints = {};


//var numbers_state = { 'all':0, 'no ctc':1, 'no money':2, 'no money and no estimates':3 };
var numbers_state = { 'no ctc':0, 'no money':1 };
imp.show_numbers_state = numbers_state['no money'];

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

imp.projects.show_business_comments = function (event, business_comments_url, args) {
    imp.show_issue_detail(null, business_comments_url, "loading comments", args);
    event.stopPropagation();
    return false;
};

imp.show_business_history = function(url) {

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

imp.projects.cycle_status = function(event, el, url) {
    event.stopPropagation();
    var on_done = imp.loading("updating status");
    $.ajax({type:"POST",
            url: url,
            dataType:"json",
            success : function (data) {
		on_done();
		$(el).html("("+data.new_status+")");

		if ( data.is_open ) {
		    $(el).parents(".project_li").addClass("open_project").removeClass("closed_project");
		} else {
		    $(el).parents(".project_li").addClass("closed_project").removeClass("open_project");
		}
            }
           });
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
    imp.set_assigned_by_clickable(issue_row_container);
    imp.attach_issue_filters(issue_row_container);
    imp.toggle_show_all_users(issue_row_container, imp.config.logged_in_username);
};

imp.set_assigned_by_clickable = function(issue_row_container) { 
    var currently_filtered_by;
    issue_row_container.find('th.estimates_cell').click(function() {
	var username = $(this).data('username');
	if (!username)
	{
	    return;
	}
	issue_row_container.find('th.estimates_cell').removeClass('filtered');
	if (currently_filtered_by == username)
	{
	    issue_row_container.find('.issue_instance_row').show();
	    currently_filtered_by = null;
	} else {
	    imp.toggle_issues_for_user(issue_row_container, username);
	    $(this).addClass('filtered');
	    currently_filtered_by = username;
	}
    });
};

imp.toggle_issues_for_user = function (issue_row_container, username)
{
    issue_row_container.find(".issue_instance_row[assigned_to!='" + username + "']").hide();
    issue_row_container.find(".issue_instance_row[assigned_to='" + username + "']").show();
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

imp.popup_page = function(url, big) {

    $(".project_card_dialog_container").find(".dialog_content").html("loading...");
    if (imp.popup_dialog) {
	$(".project_card_dialog_container").find(".dialog_content").load(url);
    } else {
	$(".project_card_dialog_container").dialog( { width: 600,
						      height: $(window).height()*0.8,
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

imp.submit_popup_form = function(el, callback, args) {
    
    var form_el = $(el).parents("form");
    var on_done = imp.loading("saving");
    $.ajax({type:"POST",
            url: form_el.attr('action'),
            data: form_el.serialize(),
            success : function (data) {
		on_done();
		var auto_close = true;
		if( callback && !callback(data) ) {
		    auto_close = false;
		}
		if ( args && args.display_results ) {
		    auto_close = false;
		    $(".project_card_dialog_container").find(".dialog_content")[0].innerHTML=data;
		}

		if ( auto_close ) {
		    $(".project_card_dialog_container").dialog('close');
		}
            }
           });

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

imp.toggle_show_adhoc_issues = function() {
    $(".adhoc_issue_row").toggle();
};

imp.toggle_show_numbers = function() {

    imp.show_numbers_state += 1;
    if ( imp.show_numbers_state >= Object.keys(numbers_state).length ) {
	imp.show_numbers_state = 0;
    }
    imp.refresh_show_numbers();
};

imp.edit_project_status = function(event, el) {
    event.stopPropagation();

    var callback = function(data) {

	if ( data.is_open ) {
	    $(el).parents(".project_li").addClass("open_project").removeClass("closed_project");
	} else {
	    $(el).parents(".project_li").addClass("closed_project").removeClass("open_project");
	}
    };
    
    var args = { blank_entry: false, callback: callback };
    imp.show_inline_editor(el, args);
    return false;
};

imp.create_accordions = function() {
    $(".accordion .accordion-toggle").bind('click', function() {
        $(this).parent('.accordion').find('.accordion_content').slideToggle();
    });
};

imp.refresh_show_numbers = function() {
    if ( imp.show_numbers_state == numbers_state['no ctc'] ) {
        $(".money_cell").show();
	$(".money_cell.money_ctc").hide();
	$(".estimates_cell").show();
    } else if ( imp.show_numbers_state == numbers_state['no money'] ) {
	$(".money_cell").hide();
	$(".estimates_cell").show();
        $(".money_cell.money_ctc").hide();
    } else if ( imp.show_numbers_state == numbers_state['all'] ) {
	$(".money_cell").show();
	$(".estimates_cell").show();
        $(".money_cell.money_ctc").show();
    } else if ( imp.show_numbers_state == numbers_state['no money and no estimates'] ) {
	$(".money_cell").hide();
	$(".estimates_cell").hide();
        $(".money_cell.money_ctc").hide();
    }
};

imp.refresh_all_checklists = function(url) {
    var on_done = imp.loading("saving");
    $.ajax({type:"POST",
            url: url,
            success : function (data) {
		on_done();
                window.reload();
            }
           });    
};

imp.refresh_checklist_navigation = function(business_id) {
    var container = $("#checklist_menu_container");
    var url = container.attr('data-refresh-url');
    container.load(url);

    $(".checklist_status_icon[business_id="+business_id+"]").each(function() {
	var icon_el = $(this);
	url = icon_el.attr('data-refresh-url');
	icon_el.load(url);
    });
};

imp.on_clear_adhoc_issue = function(el, issue_id, url) {
    
    if ( ! confirm( "Make this into a development issue?" ) ) {
        return false;
    }
    var on_done = imp.loading("saving");
    $.ajax({type:"POST",
            url: url,
            success : function (data) {
		on_done();
                imp.refresh_closest_issue_parent_row(el);
            }
           });
};

imp.show_assigned_issues = function() {
    alert('what');
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

    $(window).on('blur', function(){

  	  var parent = $('issue_edit_box').parent();
	  var div_sibling = parent.find('.edit_issue_subject');
	  $('.issue_edit_box').remove()
   	  div_sibling.show();
	  
    });

    $('.estimates_cell').click(function() {
	imp.show_assigned_issues($(this).data('username'));
    });

};

$(document).ready(imp.on_document_ready);


