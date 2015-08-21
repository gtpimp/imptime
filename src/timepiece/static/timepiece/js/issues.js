var imp = imp || {};

imp.inline_editor_active = false;
imp.current_issue_detail_url = null;
imp.current_issue_id = null;

imp.highlight_issue = function(issue_id) {
    // highlight the given issue or the default issue

    if ( imp.highlight_issue_id ) {
	$("#"+imp.highlight_issue_id).removeClass("highlight");
    }

    if (!issue_id) {
	issue_id = imp.highlight_issue_id;
    }
    if (!issue_id) {
	return;
    }
    imp.highlight_issue_id = issue_id;

    var issue_el = $("#"+issue_id);
    issue_el.addClass("highlight");

    setTimeout( function() {
        issue_el.scrollintoview();
        }, 
                200 );
};

imp.search_on_issue_number = function(issue_number) {
    $(".issue_search .search_term").val(issue_number);
    $(".issue_search .search_term").parents("form").submit();
};

imp.show_issue_detail = function(issue_id, url, msg, args) {
    msg = msg || "loading issue detail";
    var on_done = imp.loading(msg);

    $(".issue_detail").load(url,
			    function() {

				if (args && args.reload_on_done) {
				    window.location=args.reload_on_done;
				    return;
				}
				

                                var el = $("#" + issue_id);
				el.find(".subject_class input").focus();
                                imp.refresh_hidden_fields(el);
				imp.current_issue_detail_url = url;
				if ( issue_id ) {
				    imp.highlight_issue(issue_id);
                                    imp.current_issue_id = issue_id;
				}

				// $(".issue_detail .edit_comment_section").hover(function() {
				// 						   $(this).find(".edit_comment_button").show();
				// 					       },
				// 					       function() {
				// 						   $(this).find(".edit_comment_button").hide();
				// 					       });

				on_done();
			    });

 };

imp.refresh_issue_detail = function() {

    imp.show_issue_detail(imp.current_issue_id, imp.current_issue_detail_url);
};

imp.post_issue_number_form = function(form_child_el, issue_id) {
    var form = $(form_child_el).parents("form");
    $.ajax({type:"POST",
	    url: form.attr('action'),
	    data: form.serialize(),
	    success: function(data) {
		var issue_number = data;
		imp.refresh_issue_detail();
		$(document).find(".issue_instance_row[id='"+issue_id+"']").find(".issue_number").html(issue_number);
	    }
	   });
    return false;
};

imp.bulk_clear_selected_issues = function(project_id, clear_url) {

    if ( ! confirm('Unselect all checkboxes?') ) {
	return false;
    } 
    var project_el = $(".project_li[list_project_id="+project_id+"]");

    var on_done = imp.loading("unchecking");
    $.ajax({type:"GET",
	    url: clear_url,
	    success: function(data) {
		$(".issue_checkbox_cell input[type='checkbox']").attr("checked", false);
                imp.hide_issue_checkboxes(project_el);
		on_done();
	    }
	   });
    return false;

};

imp.bulk_check_all_issues = function(project_id, check_url) {

    if ( ! confirm('Select all checkboxes?') ) {
	return false;
    } 
    var project_el = $(".project_li[list_project_id="+project_id+"]");

    var on_done = imp.loading("Checking");
    $.ajax({type:"GET",
	    url: check_url,
	    success: function(data) {
		project_el.find(".issue_checkbox_cell input[type='checkbox']").attr("checked", true);
                imp.show_issue_checkboxes(project_el);
		on_done();
	    }
	   });
    return false;

};

imp.do_form_show  = function(element, url) {
    var button = $(element);
    var parent = button.parents(".to_expand_form_on_click").parent();
    var to_edit = $(".to_edit_expanded_form");

    $.ajax({type:"GET",
	    url: url,
	    success: function(data) {
		to_edit.append($(data));
	    }
	   });

    to_edit.show();
    to_edit.css("z-index",200);

    setTimeout(function() {
		   to_edit.find("textarea").markItUp(markdown_settings);
	       }, 100);

    function key_up_for_form(form) {
       var current_form = form;
       return function(event) {
	   event.stopImmediatePropagation();
	   if(event.which === 27) {
	       imp.do_form_remove(current_form);
	   }
       };
       to_edit.keyup( key_up_for_form(parent) );
    }
};


imp.close_add_issue = function (element) {
    imp.do_form_remove();
    return false;
};

imp.do_form_remove  = function() {
    var to_edit = $(".to_edit_expanded_form");
    to_edit.find(".new_dyn_form_container").remove();
    $(".new_dyn_form_container").remove();
    to_edit.hide();
    return false;
};


imp.create_issue_and_add_another = function(element, sprint_id, url) {
    imp.on_issue_form_submit(element, sprint_id, url, function() {
				 imp.do_form_show(element, url);
			     });
    return false;
};

imp.on_issue_form_submit = function(element, sprint_id, url, on_success) {
    var mform = $(element).parents("form");
    var on_done = imp.issue_loading("Creating issue");
    var sprint_el = $(".project_li[list_project_id="+sprint_id+"]");

    var handle_success_for_form = function(data) {
        var table_body =  sprint_el.find(".issue_list_body");
        if(table_body.length > 0) {
            table_body.append(data);
	    imp.on_issue_rows_loaded(table_body);
        }
        imp.do_form_remove();

	var issue_id = $(data).attr("id");
	$(document).find(".issue_instance_row[id='"+issue_id+"']").find(".issue_number").click();
	imp.highlight_issue(issue_id);

	on_done();
	if ( on_success ) {
	    on_success();
	}
    };

    $.ajax({type:"POST",
            url: url,
            data: mform.serialize(),
	    success: handle_success_for_form
           });
    return false;
};


imp.on_project_form_cancel = function(element) {
    imp.do_form_remove();
};

imp.delete_issue_attachment = function(url) {
    if ( ! confirm("Are you sure you want to delete this file?") ) {
	return false;
    }
    var on_global_loading_done = imp.loading("deleting");
    $.ajax({type:"GET",
	    url: url,
	    success: function(data) {
		on_global_loading_done();
		imp.refresh_issue_detail();
	    }
	   });
    return false;
};

imp.attach_upload_issue_attachment = function(el) {

    var container = el.parent();
    var input_el = container.find("input");
    var on_done = imp.issue_loading("Uploading attachment");
    container.find('.new_attachment').show();
    el.hide(); 

    input_el.fileupload({
		      type: "POST",
		      done: function (e, data) {
			  on_done();
			  imp.refresh_issue_detail();
		      }
		  });

    return false;
};

imp.attach_issue_filters = function(container) { 
    
    container.find(".filterable").each( function() {
        var el = $(this);
        var el_trigger = el.find(".filter_trigger");
        var filter_field = el.attr("filter_property");
        var filter_popup_url = el.attr("filter_popup_url");
        el.hover( function() { el_trigger.show(); },
                  function() { el_trigger.hide(); } );
        el_trigger.on("click", function() {

            if (imp.popup_dialog) {
                var dlg = $(".project_card_dialog_container").find(".dialog_content");
                dlg.html("loading options...");
                dlg.load(filter_popup_url);
            } else {
                $(".project_card_dialog_container").dialog( { width: 600,
						              height: 400,
						              open: function(event, ui) {
							          $(".project_card_dialog_container").find(".dialog_content").load(filter_popup_url);
						              }
						            });
            }
            return false;
        });
    });
};

imp.filter_on_status = function(project_id, status_name) {
    // works in conjunction with imp.attach_issue_filters
    var container = $(".project_li[list_project_id="+project_id+"]");
    if (status_name) {
        container.find(".issue_instance_row").hide();
        container.find(".issue_instance_row[status='"+status_name+"']").show();
    } else {
        container.find(".issue_instance_row").show();
    }
    $(".project_card_dialog_container").dialog('close');
    return false;
};

imp.filter_on_feature = function(project_id, feature_name) {
    // works in conjunction with imp.attach_issue_filters
    var container = $(".project_li[list_project_id="+project_id+"]");
    if (feature_name) {
        container.find(".issue_instance_row").hide();
        container.find(".issue_instance_row[feature='"+feature_name+"']").show();
    } else {
        container.find(".issue_instance_row").show();
    }
    $(".project_card_dialog_container").dialog('close');
    return false;
};

imp.hide_issue_checkboxes = function(el) {
    $(".issue_checkbox_cell").hide();
    $(el).parents("table").find(".issue_checkbox_cell_toggle").find(".hide").hide();
    $(el).parents("table").find(".issue_checkbox_cell_toggle").find(".show").show();
};
imp.show_issue_checkboxes = function(el) {
    $(".issue_checkbox_cell").show();
    $(el).parents("table").find(".issue_checkbox_cell_toggle").find(".hide").show();
    $(el).parents("table").find(".issue_checkbox_cell_toggle").find(".show").hide();
};

imp.are_issue_checkboxes_visible = function(el) {
    return $(el).parents("table").find(".issue_checkbox_cell_toggle").find(".hide").is(":visible");
};

imp.get_selected_issue_ids_for_get = function(issue_row_container) {
    var selected_issue_checkboxes = "";
    issue_row_container.find(".issue_checkbox_cell input:checked").each( function() {
									     selected_issue_checkboxes += $(this).parents(".issue_instance_row").attr("id")+",";
    });
    return selected_issue_checkboxes;
};

imp.set_issue_checkbox_hooks = function(issue_row_container) {

    var project_id = issue_row_container.attr("project_id");

    var fetch_menu_html = function(e, callback) {
	var on_done = imp.loading("Loading context menu");
	var selected_issue_ids = imp.get_selected_issue_ids_for_get(issue_row_container);
	var response = $.ajax({type:"GET",
                               url: imp.config.issue_checkbox_context_menu_url.replace("999999", project_id),
			       data: {checked_issue_numbers: selected_issue_ids},
                               success: function(data) {
				   on_done();
				   var menu = $(data);
				   menu.appendTo(document.body);
				   callback(e, menu);
                               }
                              });
    };

    var display_menu = function(e, menu) {
	menu.show();

	var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
	top = e.pageY;
	if (top + menu.height() >= $(window).height()) {
	    top -= menu.height();
	}
	if (left + menu.width() >= $(window).width()) {
	    left -= menu.width();
	}

	// Create and show menu
	menu.css({zIndex:1000001, overflow:"auto", height:"50%", width: "300px" /*left:left, top:top*/})
	    .bind('contextmenu', function() { return false; });

	// Cover rest of page with invisible div that when clicked will cancel the popup.
	var bg = $('<div></div>')
	    .css({left:0, top:0, width:'100%', height:'100%', position:'absolute', zIndex:1000000})
	    .appendTo(document.body)
	    .bind('contextmenu click', function() {
		      // If click or right click anywhere else on page: remove clean up.
		      bg.remove();
		      menu.remove();
		      return false;
		  });

	// When clicking on a link in menu: clean up (in addition to handlers on link already)
	menu.find('a').click(function() {
				 bg.remove();
				 menu.remove();
			     });
    };

    // On contextmenu event (right click)
    issue_row_container.find(".issue_checkbox_cell").bind('contextmenu', function(e) {
							      fetch_menu_html( e, display_menu );
							      return false;
							  });

    // If an issue checkbox is ticked, then show all issue checkboxes
    issue_row_container.find(".issue_checkbox_cell input").click(function(e) {
								     if ( $(this).attr("checked") ) {
									 imp.show_issue_checkboxes($(this));
								     }
								 });

    // If an issue checkbox is hidden, show on hover and hide on unhover
    issue_row_container.find(".issue_checkbox_td").hover(function() {
							     var el = $(this).find(".issue_checkbox_cell").show();
							 },
							 function() {
							     if ( ! imp.are_issue_checkboxes_visible($(this)) ) {
								 var el = $(this).find(".issue_checkbox_cell").hide();
							     }
							 });

};

imp.toggle_show_all_users = function(menu_el, logged_in_username) {
    var project_el = $(menu_el).parents(".project_li");
    var trigger = project_el.find(".toggle_show_all_users_trigger");
    var all_shown = trigger.attr("all_shown");
    var cells = project_el.find(".estimates_cell").not("[data-username="+logged_in_username+"]");
    if ( all_shown == "true" ) {
        cells.css({"display":"none"});
        trigger.attr("all_shown", "false");
    } else {
        cells.css({"display":"table-cell"});
        trigger.attr("all_shown", "true");
    }
    return false;
};

imp.refresh_show_all_users = function(menu_el, logged_in_username) {
    var on_done = imp.loading("toggling...");
    var project_el = $(menu_el).parents(".project_li");
    var trigger = project_el.find(".toggle_show_all_users_trigger");
    var all_shown = trigger.attr("all_shown");
    var cells = project_el.find(".estimates_cell").not("[data-username="+logged_in_username+"]");
    if ( all_shown == "true" ) {
        cells.css({"display":"table-cell"});
    } else {
        cells.css({"display":"none"});
    }
    on_done();
    return false;
};

imp.on_add_issue_comment = function(el, url) {

    var container = el.parent();
    var on_done = imp.issue_loading("Creating comment");
    var input_el = container.find("textarea");
    container.find('.new_comment').show();
    el.hide(); 

    var response = $.ajax({type:"POST",
                           url: url,
                           data: {'comment':input_el.val()}
                          });
    response.done( function() {
	on_done();
	imp.refresh_issue_detail();
    } );
};

imp.on_edit_issue_comment = function(el, url) {

    var container = el.parent();
    var on_done = imp.issue_loading("Saving comment");
    var input_el = container.find("textarea");
    el.hide(); 

    var response = $.ajax({type:"POST",
                           url: url,
                           data: {'comment':input_el.val()}
                          });
    response.done( function() {
	on_done();
	imp.refresh_issue_detail();
    } );
};

imp.delete_issue_comment = function(url) {
    if ( ! confirm('Are you sure you want to delete this comment?') ) { 
	return false; 
    };
    var on_done = imp.issue_loading("Deleting comment");

    var response = $.ajax({type:"POST",
                           url: url
                          });
    response.done( function() {
		       on_done();
		       imp.refresh_issue_detail();
		   });
    return false;
};

imp.on_project_form_submit = function(element, url) {
    var mform = $(element);
    var handle_success_for_form = function(form) {
          var a_form = form;
          return function(data) {
              var form = a_form;
              var button = a_form.parent().parent().parent();
              $(document).find(".project_list").prepend(data);
              imp.do_form_remove(button);
          };
    };
    var response = $.ajax({type:"POST",
                           url: url,
                           data: mform.serialize()
                          });
    response.done( handle_success_for_form(mform) );
    return false;
};

imp.delete_issue_from_issues_list = function(element, url, item_id) {
    var button = $(element);
    var closest_row = button.closest(".issue_instance_row");
    var on_done = imp.issue_loading(item_id, "deleting");
    $.ajax({type:"POST",
            url: url,
            data : { item_id: item_id },
            dataType:"json",
            success: function() {
                closest_row.remove();
		on_done();
            }});

};

imp.sort_issues_by_state = function(el, sort_url) {
    var on_done = imp.issue_loading("Sorting");
    var issue_list_el = $(el).parents(".issue_order_info").find(".sort_issues_by_state");
    var state_els = issue_list_el.find("li");
    var ordered_states = [];
    state_els.each(function(index, row) {
		       var elem = $(row);
		       var state_name = elem.attr("state_name");
		       ordered_states.push(state_name);
		   });
    var joined_ordered_states = ordered_states.join(',');
    var response = $.ajax({type:"POST",
                           url: sort_url,
                           data: { ordered_states:joined_ordered_states },
                           dataType:"json",
                           success : function (data) {
			       on_done();
			       window.location = data.redirect_url;
                           }
                          });
};

imp.clickable_description_box = function(element, url, item_id, args) {

    var textbox = $(element),
        commentField = $("<form/>");
    commentField = commentField.attr('action',url).attr('method','post');
    var value = textbox.find(".markdown_content").html();
    var textField =$("<textarea/>").attr('name','new_value');
    textbox.find(".markdown_help").show();
    var attachments = textbox.parents(".issue_detail").find(".attachment_section");

    args = args || {};

    var cancel = function() {
	textbox.show();
	submitButton.remove();
	textField.remove();
	textbox.find(".markdown_help").hide();
	imp.refresh_issue_detail();
	attachments.show();
    };

    textField.keyup(function(e) {
			e.stopImmediatePropagation();
			if(e.which === 27) {
			    cancel();
			}
    });
    textbox.hide();
    attachments.hide();
    var itemField =$("<input/>").attr('type','hidden').attr('value', item_id).attr('name','item_id');
    var submitButton = $("<input/>").attr('type','button').attr('value','Save').addClass("btn");
    var cancelButton = $("<input/>").attr('type','button').attr('value','Cancel').addClass("btn");
    commentField.append(itemField);
    commentField.append(textField);

    submitButton.click(function(e) {
			   var new_value = textField.val();
			   var on_done = imp.loading("saving");
			   var response = $.ajax({type:"POST",
						  url: url,
						  data : { item_id: item_id, new_value: new_value },
						  dataType:"json"});
			   response.done( function() {
					      on_done();
					      if ( ! args.refresh_url ) {
						  imp.refresh_issue_detail();
					      } else {
						  imp.show_issue_detail(null, args.refresh_url, "refreshing");
					      }
					      attachments.show();
					  });
		       });
    commentField.append(submitButton);
    commentField.append(cancelButton);
    textbox.parent().append(commentField);
    textField.focus();
    textField.value = value;
    textField.html(value);

    cancelButton.click(cancel);

    textField.markItUp(markdown_settings);
};


imp.clickable_time_estimate = function(element, url, user_id, issue_id) {
    element = $(element).find("span.edit_issue_subject");
    var initial_value = element.find(".estimated_hours").html() || "0";

    imp.highlight_issue(issue_id);
    return imp.clickable_subject_box(element, url, user_id, null, "auto", issue_id, initial_value=initial_value);
};

imp.sync_from_remote = function(issue_id, url) {
    var on_done = imp.issue_loading(issue_id, "synching issue " + issue_id);
    var response = $.ajax({type:"GET",
                           url: url,
                           data : { issue_id: issue_id },
                           success: function(data) {
			       on_done();
			       imp.refresh_issue_detail();
			   }
			  });
};

imp.clickable_subject_box = function(element, url, item_id, size, width, issue_id, initial_value) {

    if (!issue_id) {
	issue_id = item_id;
    }

    var textbox = $(element),
        commentTextArea = $("<input/>");
    var value;
    if ( initial_value ) {
	value = initial_value;
    } else {
	value = $.trim(textbox.html());
    }
    size = size || value.length;
    width = width || "80%";

    if ( value == "&nbsp;" ) {
	value = "0";
    }

    imp.highlight_issue(issue_id);

    commentTextArea = commentTextArea.attr("data-issue-id", issue_id).attr("type","text").attr("value",value).attr("size",size).css("width",width).css("position","relative").css("overflow","visible").css("z-index",200);
    textbox.parent().append(commentTextArea);
    textbox.hide();
    commentTextArea.addClass("issue_edit_box");
    commentTextArea.select();

    var create_event_handler = function(editable_el, readonly_el) {
        return function(e) {
            var new_value = editable_el.val();
            if (e.which === 13) {
                $("body").unbind("keydown", event_handler);
                readonly_el.html(new_value);
                editable_el.remove();
                readonly_el.show();
	        var on_done = imp.issue_loading(issue_id, "editing");
                var response = $.ajax({type:"POST",
                                       url: url,
                                       data : { item_id: item_id, new_value: new_value, issue_id: issue_id },
                                       dataType:"json"});
                response.done( function() {
		    imp.refresh_closest_issue_parent_row(readonly_el);
		    on_done();
	        } );
            }

            if(e.which === 27) {
                $("body").unbind("keydown", event_handler);
                editable_el.remove();
                readonly_el.show();
            }
        };
    };
    var event_handler = create_event_handler(commentTextArea, textbox);
    $("body").bind("keydown", event_handler);
};

imp.refresh_closest_issue_parent_row = function(element) {
    element = $(element);
    var closest_row = element.parents(".issue_instance_row");
    var url = closest_row.attr("refresh_url");
     $.ajax({type:"GET",
             url: url,
             success: function(data) {
                 $(closest_row)[0].outerHTML = $(data)[0].outerHTML;
		 imp.on_issue_rows_loaded($(".issue_instance_row"));
           }
         });
};


// imp.ajax_selection = function(element, url, update_url) {

//     var handle_ajax_data_given = function (element , update_url) {
//         var _update_url = update_url;
//         var _element = element;
//         var item_id = $(element).attr("id");
//         function new_data_handler (data) {
//             var selection_val ="nothing";
//             if (data.length) {
//              selection_val= data[0][0];
//             }
//             imp.dynamic_option_selection(_element, item_id, data, update_url);
//         }
//         return new_data_handler;
//     };

//     var response = $.ajax({ type:"GET",
//                             url: url
//                           });

//     response.done( handle_ajax_data_given (element, update_url) );

// };

imp.clickable_feature_name = function (element, url, item_id) {
    // clear the parent of select boxes...
    $(element).html("");
    return imp.clickable_subject_box(element, url, item_id, "200px", "200px");
};

imp.dynamic_option_addition = function (element, item_id, update_url) {
    option_addition_button = $("<input/>").attr("type", "button").attr('value','');
    option_addition_button.attr("class","option_addition");
    option_addition_button.css("border","none");

    var handle_click_for = function (element, item_id, update_url) {
        var _element = element;
        var _item_id = item_id;
        var _update_url = update_url;
        return function (event) {
            var element = _element;
            var item_id = _item_id;
            var url = _update_url;
            imp.clickable_feature_name(element, url, item_id);
        };
    };

    option_addition_button.click( handle_click_for (element, item_id, update_url) );
    $(element).append(option_addition_button);
};

imp.select_business_feature = function(element, issue_id, request_url, update_url , new_url) {

    var response = $.ajax( { type: "GET",
                             url : request_url
                           });

    imp.highlight_issue(issue_id);

    var create_widget_at_done = function (element, issue_id, update_url) {
        var _element = element;
        var _update_url = update_url;
        var _issue_id = issue_id;
        return function (data) {
            imp.dynamic_option_selection(_element, issue_id, data, update_url);
            imp.dynamic_option_addition(_element, issue_id, new_url);
        };
    };
    response.done( create_widget_at_done(element, issue_id,  update_url) );

};

imp.clickable_assign_user_box = function(element, update_url, issue_id) {
    var el = $(element);
    var form = el.find(".assign_user_form");

    el.find(".existing_assign").hide();
    form.show();

    imp.highlight_issue(issue_id);

    var cancel = function() {
	el.find(".existing_assign").show();
	form.hide();
    };

    var save = function() {
	var on_done = imp.issue_loading(issue_id, "assigning");
	var value = form.find("[name='user_1']").val();

	$.ajax({type:"POST",
		url: update_url,
		data : { issue_id: issue_id, user_id: value },
		dataType:"json",
		success: function() {
		    el.find(".existing_assign").show();
		    imp.refresh_closest_issue_parent_row(el);
		    on_done();
		}});
    };

    form.find(".assign_button").click(function(event) {
					  event.stopImmediatePropagation();
					  save();
				      });

    form.keyup( function(event) {
		    event.stopImmediatePropagation();
		    if(event.which === 27) {
			cancel();
		    }
		    return false;
		});

    return false;
};

imp.show_inline_editor = function(el, args) {

    if ( imp.inline_editor_active ) {
    return false;
    }

    imp.inline_editor_active = true;

    if ( ! args ) {
	    args = { blank_entry:true };
    }

    var on_done = imp.loading("fetching options...");

    var td = $(el);
    imp.readonly_value = td.find(".readonly_value");
    imp.editor_container = td.find(".inline_editor");
    var editor = imp.editor_container.find(".transient_selection");
    imp.created_value_editor = imp.editor_container.find("input");
    var url_for_update = td.attr("url_for_update");
    var url_for_options = td.attr("url_for_options");
    var old_value = editor.val();
    if ( ! old_value ) {
	old_value = td.attr("selected_value");
    }

    var issue_id = td.attr("issue_id");

    imp.highlight_issue(issue_id);

    var deactivate_select = function() {
	imp.inline_editor_active = false;
	imp.editor_container.hide();
	imp.readonly_value.show();
    };

    var on_changed = function() {
        imp.editor_container.hide();
        var on_done = imp.issue_loading("saving");
        var value = imp.editor_container.find("input[name='transient_selection']:checked").val();
        var created_value = imp.created_value_editor.val();
        imp.created_value_editor.val('');
        var response = $.ajax({type:"POST",
                               url: url_for_update,
                               data : { issue_id: issue_id, selected_value:value, created_value:created_value },
                               dataType:"json",
                               success: function(data) {
                                   imp.readonly_value.html(data.new_value);
                                   imp.readonly_value.show();
                                   imp.editor_container.hide();
                                   deactivate_select();
                                   imp.refresh_closest_issue_parent_row(td);

                                   on_done();

                                   if ( args.callback ) {
                                       args.callback(data);
                                   }
                               }
                              });
    };

    var activate_select = function() {

	//editor.change( on_changed );

        if ( ! imp.inline_editor_key_event_set ) {
            $("body").keyup( function(event) {
                if ( imp.inline_editor_active == false ) {
                    return;
                }
                event.stopImmediatePropagation();
                if(event.which === 27) {
		    deactivate_select();
	        }
                if(event.which === 13) {
		    on_changed();
	        }
            });
            imp.inline_editor_key_event_set = true;
        };
        
        if ( imp.created_value_editor.length > 0 ) {
            imp.created_value_editor.on("keyup", function() {
                var x = imp.created_value_editor.val();
                if ( x.length > 0 ) {
                    imp.editor_container.find("input[type='radio']").parent("label").hide();
                    imp.editor_container.find("label[lower_case_value^='" + x + "']").show();
                } else {
                    imp.editor_container.find("input[type='radio']").parent("label").show();
                }
            });
        }

	imp.readonly_value.hide();
	imp.editor_container.show();
        imp.editor_container.find("input[name='transient_selection']").on("click", function() {
            imp.created_value_editor.val("");
            on_changed();
        });
        imp.inline_editor_active = true;

    };

    if (url_for_options) {
	$.ajax({type:"GET",
		url: url_for_options,
		success: function(data) {
		    var new_option;
		    editor.html("");

		    if ( args.blank_entry ) {

                        new_option = $("<label><input value='' type='radio' name='transient_selection'><i>None</i></label>");
			editor.append(new_option);
		    }

		    $.each(data, function( index, value ) {
			       
                        new_option = $("<label lower_case_value='"+value[1].toLowerCase() + "'><input id='"+ value[0] + "' value='" + value[0] + "' type='radio' name='transient_selection'>"+value[1]+"</label>");
			if (old_value == value[0]) {
			    new_option.find("input").attr("checked",true);
			}
			editor.append(new_option);
		    });

		    activate_select();
		    on_done();
		}
	       });
    } else {
	activate_select();
	on_done();
    }

    return false;

};

imp.show_issue_history = function(url) {

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


