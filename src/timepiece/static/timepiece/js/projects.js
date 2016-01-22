imp.projects = imp.projects || {};

imp.projects.already_loaded_sprints = {
    get_already_loaded_issue_list : function(project_id) {
        return $(".hidden_project_list").find(".project_detail[project_id="+project_id+"]");
    },
    cache_already_loaded_issue_lists : function() {
        $(".hidden_project_list").append( $(".issue_list").find(".project_detail") );
    },
    clear_cache_for_project : function( project_id ) {
        $(".hidden_project_list").find(".project_detail[project_id="+project_id+"]").remove();
        $(".issue_list").find(".project_detail[project_id="+project_id+"]").remove();
        imp.projects.already_loaded_sprints[project_id] = null;
    }
};

imp.on_error = function(err) {
    var err_msg;
    if ( err.error ) {
        err_msg = err.error();
    } else {
        err_msg = err;
    }
    alert(err_msg);
};

//var numbers_state = { 'all':0, 'no ctc':1, 'no money':2, 'no money and no estimates':3 };
var numbers_state = { 'no ctc':0, 'no money':1 };
imp.show_numbers_state = numbers_state['no money'];

imp.projects.show_project_card_as_popup = function (event, project_card_url, msg, args) {
    imp.current_issue_id = "";
    imp.show_issue_detail(null, project_card_url, msg, args);
    event.stopPropagation();
    return false;
};

imp.projects.popup_business_comments = function(business_id) {
    return false;
};

imp.projects.show_business_comments = function (event, business_comments_url, args) {
    imp.current_issue_id = "";
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

imp.projects.set_project_title = function( project ) {
    var project_title_el = $(".active_project_title");
    project_title_el.find(".project_id").html("#" + project.id);
    project_title_el.find(".project_name").html(project.name);
    project_title_el.find(".project_description").html(project.short_description);
    project_title_el.find(".business_name").html(project.business.name);
};

imp.projects.set_project_menu = function( project_menu ) {
    $(".project_menu .project_actions").html(project_menu);
};

function make_data_done_function_for_element(element) {

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

imp.projects.attach_sortable = function(sortable, sortable_url, move_issue_to_project_url ) {
    var sortable_args = { cursor: "move",
                          appendTo: document.body,
                          helper: 'clone',
                          connectWith: ".issue_drag_destination" };
    sortable_args.update = imp.projects.on_sortable_changed_for_url(sortable_url);
    sortable_args.receive = imp.projects.on_sortable_changed_for_url(sortable_url);
    sortable.sortable(sortable_args);
    
};

imp.projects.load_or_display_issues = function(project_id, element, expand_url) {
    if ( imp.highlight_issue_id ) {
	$("#"+imp.highlight_issue_id).removeClass("highlight");
        imp.highlight_issue_id = null;
    }
    
    imp.current_issue_detail_url = null;
    imp.current_issue_id = null;

    var current_row = $(element);
    var area_to_insert = $(".issue_list");
    area_to_insert.find(".project_detail").hide();
    var loading = area_to_insert.find(".loading");
    loading.show();

    var show_issues_from_data = function(data) {
        imp.projects.already_loaded_sprints.cache_already_loaded_issue_lists();

        var already_loaded_project_el = imp.projects.already_loaded_sprints.get_already_loaded_issue_list(project_id);
        if ( already_loaded_project_el.length > 0 ) {
            area_to_insert.find(".issue_list_content").html();
            area_to_insert.find(".issue_list_content").append(already_loaded_project_el);
            already_loaded_project_el.show();
        } else {
            area_to_insert.find(".issue_list_content").html(data.issue_list_html);
        }
        imp.projects.set_project_title(data.project);
        imp.projects.set_project_menu(data.project_menu);
        imp.on_issue_rows_loaded(area_to_insert);
        imp.active_project = data.project;
        $(".project_li").removeClass("active");
        $(".project_li[list_project_id="+data.project.id+"]").addClass("active");

        var sortable = $(area_to_insert.find(".issue_list_body"));
        var sortable_url = $(sortable).attr("update_order_url");
        var move_issue_to_project_url = $(sortable).attr("move_issue_to_project_url");

	imp.projects.attach_sortable( sortable, sortable_url, move_issue_to_project_url );
        imp.on_issue_rows_loaded($(element));
        imp.projects.already_loaded_sprints[project_id] = data;
    };

    if ( imp.projects.already_loaded_sprints[project_id] ) {
        show_issues_from_data(imp.projects.already_loaded_sprints[project_id]);
        loading.hide();
    } else {
        $.ajax({ type:"GET",
                 url: expand_url,
                 dataType:"json",
                 success: function(data) {
                     show_issues_from_data(data);
                     loading.hide();
                 },
                 error: function(err) {
                     alert(err);
                 }
               });
    }
};

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

imp.refresh_project = function(project_id) {
    var el = $("li[list_project_id="+project_id+"]");
    var project_url = imp.config.project_issues_refresh_url.replace("999999", project_id);
    var project_container = $(el).find(".project_expand");
    imp.projects.already_loaded_sprints.clear_cache_for_project(project_id);
    imp.projects.load_or_display_issues(project_id, project_container, project_url);
};

imp.on_issue_rows_loaded = function(issue_row_container) {
    $(issue_row_container).find(".drag_img").parents("tr").hover( function() {
	$(this).find('.drag_img').show();
	$(this).find('.emacs_copy_img').show();
        $(this).find('.issue_action_menu_img').show();
	$(this).addClass("hovered");	
    }, function() {
	$(this).find('.drag_img').hide();
	$(this).find('.emacs_copy_img').hide();
        $(this).find('.issue_action_menu_img').hide();
	$(this).removeClass("hovered");
    });
    imp.refresh_hidden_fields(issue_row_container);
    imp.highlight_issue();
    imp.set_issue_checkbox_hooks(issue_row_container);
    imp.set_assigned_by_clickable(issue_row_container);
    imp.attach_issue_filters(issue_row_container);
    imp.refresh_show_all_users(issue_row_container, imp.config.logged_in_username);
    imp.update_splitter_dimensions();
};

imp.set_assigned_by_clickable = function(issue_row_container) { 
    var currently_filtered_by;
    issue_row_container.find('.toggle_assigned_by').click(function() {
	var username = $(this).data('username');
	if (!username)
	{
	    return;
	}
	issue_row_container.find('.toggle_assigned_by').removeClass('filtered');
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
    var split_position = Cookies.get('splitter_position');
    if ( ! split_position || parseInt(split_position)<1 ) {
        split_position = "25%";
    } else {
        split_position += "px";
    }
    $(".splitter").split( { orientation:'vertical', limit:100, position:split_position,
                            onDragEnd: function() { imp.update_splitter_dimensions(); } } );
    imp.update_splitter_dimensions();

    $(window).on("resize", function(e) {
 	imp.update_splitter_dimensions();
    });

};

imp.update_splitter_dimensions = function() {
    var splitter = $(".splitter");
    var top = splitter.offset().top;
    var wh = $(window).height();
    var height = (wh-top-20)+"px";
    splitter.height(height);
    var width = $(window).width()-100;
    if ( $(".project_menu").is(":visible") ) {
        width -= $(".project_menu").width();
    }
    splitter.width(width);
    var split_position = splitter.split().position();
    Cookies.set('splitter_position', split_position);
    splitter.split().refresh();

    var pl_el = $(".project_list");
    height = wh - (pl_el.offset().top + 20);
    pl_el.height( height );
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

    var project_el = $(el).parents(".project_li");
    var callback = function(data) {

	if ( data.is_open ) {
	    project_el.addClass("open_project").removeClass("closed_project");
	} else {
	    project_el.addClass("closed_project").removeClass("open_project");
	}
    };
    
    var args = { blank_entry: false, callback: callback };
    imp.show_inline_editor(project_el, args);
    return false;
};

imp.create_accordions = function() {
    $(".accordion .accordion-toggle").bind('click', function() {
        $(this).parent('.accordion').find('.accordion_content').slideToggle();
    });
};

imp.refresh_show_numbers = function(issue_row_container) {
    var parent_el = $("body");

    if ( imp.show_numbers_state == numbers_state['no ctc'] ) {
        parent_el.find(".money_cell").show();
	parent_el.find(".money_cell.money_ctc").hide();
	parent_el.find(".estimates_cell").show();
    } else if ( imp.show_numbers_state == numbers_state['no money'] ) {
	parent_el.find(".money_cell").hide();
	parent_el.find(".estimates_cell").show();
        parent_el.find(".money_cell.money_ctc").hide();
    } else if ( imp.show_numbers_state == numbers_state['all'] ) {
	parent_el.find(".money_cell").show();
	parent_el.find(".estimates_cell").show();
        parent_el.find(".money_cell.money_ctc").show();
    } else if ( imp.show_numbers_state == numbers_state['no money and no estimates'] ) {
	parent_el.find(".money_cell").hide();
	parent_el.find(".estimates_cell").hide();
        parent_el.find(".money_cell.money_ctc").hide();
    }
    
    // if ( issue_row_container ) {
    //     _show_numbers_for_el(issue_row_container.parents(".issue_list_content"));
    // } else {
    //     parent_el = $("body");
    // }
    // _show_numbers_for_el($("body"));


};

imp.refresh_hidden_fields = function(some_el_in_the_project) {
    imp.refresh_show_numbers(some_el_in_the_project);
    imp.refresh_show_all_users(some_el_in_the_project, imp.config.logged_in_username);
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

    var move_issue_to_project_url = $(".project_list").attr("move_issue_to_project_url");
    $(".project_li").droppable( {
        drop: function( event, ui ) {

            var from_el = $(event.srcElement);
            //from_el = ui.draggable;

            var issue_row = from_el.parents(".issue_instance_row");
            if ( issue_row.length == 0 ) {
                return false;
            }
            
            var issue_id = issue_row.attr("id");
            var project_el = $(event.target);
            var loading_indicators = project_el.find(".loading");
            loading_indicators.show();
            var project_id = project_el.attr("list_project_id");
            $.ajax({type:"POST",
                    url: move_issue_to_project_url,
                    data: { issue_id:issue_id, dest_project_id: project_id },
                    dataType:"json",
                    success : function (data) {
                        if ( data.status == "ok" ) {
                            var already_loaded_project_el = imp.projects.already_loaded_sprints.get_already_loaded_issue_list(project_id);
                            if ( already_loaded_project_el ) {
                                already_loaded_project_el.find(".issue_list_body").append(issue_row);
                            } else {
                                issue_row.remove();
                            }
                            imp.projects.already_loaded_sprints.clear_cache_for_project(project_id);
                        } else {
                            imp.on_error("Failed");
                        }
                        loading_indicators.hide();
                        
                    },
                    error : function(err) {
                        loading_indicators.hide();
                        imp.on_error(err);
                    }
                   });
            return true;
        },
        tolerance: "pointer",
        hoverClass: "drop-hover"
    });
    
    $(".project_li").each(function(item, project_row) {
        var elem = $(project_row);
        var preloaded = ( elem.attr("preloaded") == "true" );
        if (preloaded) {
            elem.trigger('click');
        }
    });

    imp.create_splitter();
    imp.attach_sprint_headings();

    $(window).on('blur', function(){
  	var parent = $('issue_edit_box').parent();
	var div_sibling = parent.find('.edit_issue_subject');
	$('.issue_edit_box').remove();
   	div_sibling.show();
    });

    $('.estimates_cell').click(function() {
	imp.show_assigned_issues($(this).data('username'));
    });

    $('.sprint_menu_trigger').click(function() {
        $(".project_menu").animate({width:'toggle'}, 200, function() { imp.update_splitter_dimensions(); } );
    });

};

$(document).ready(imp.on_document_ready);
