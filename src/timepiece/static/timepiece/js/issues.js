var imp = imp || {};

imp.inline_editor_active = false;
imp.current_issue_detail_url = null;

imp.issue_loading = function(item_id, msg) {
    var loading_el = $("#loading_issue_"+item_id);
    loading_el.show();

    if ( ! msg ) {
	msg = "loading";
    }

    var on_global_loading_done = imp.loading(msg + " " + item_id);

    var on_done = function() {
	loading_el.fadeOut();
	on_global_loading_done();
    };
    return on_done;
};

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
    $("#"+issue_id).addClass("highlight");
};

imp.show_issue_detail = function(url) {
    var on_done = imp.loading("loading issue detail");

    $(".issue_detail").load(url,
			    function() {
				$(".issue_detail .subject_class input").focus();
				imp.refresh_show_money();
				imp.current_issue_detail_url = url;
				on_done();
			    });

 };

imp.refresh_issue_detail = function() {

    imp.show_issue_detail(imp.current_issue_detail_url);
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
    to_edit.hide();
    return false;
};


imp.create_issue_and_add_another = function(element, sprint_id, url) {
    imp.on_issue_form_submit(element, sprint_id, url, function() {
				 imp.do_form_show(element , url);
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
	    imp.on_issue_rows_loaded();
        }
        imp.do_form_remove();
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
    container.find('.new_attachment').show();
    el.hide(); 

    input_el.fileupload({
		      type: "POST",
		      done: function (e, data) {
			  imp.refresh_issue_detail();
		      }
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

imp.clickable_description_box = function(element, url, item_id) {

    // dev note: most of this function should be replaced with a
    // hidden snippet in one of the template files, which gets
    // displayed on demand. eg see how the rates popup works.

    var textbox = $(element),
        commentField = $("<form/>");
    commentField = commentField.attr('action',url).attr('method','post');
    var value = textbox.find(".content").html();
    value = value.replace(/<br>/g,"\n");
    var textField =$("<textarea/>").attr('name','new_value');
    textField.css({height:"400px"});
    textField.html(value);
    textField.keyup(function(e) {
			e.stopImmediatePropagation();
			if(e.which === 27) {
			    var form_parent = $(this).parent().parent();
			    var div_parent = form_parent.find(".static_div");
			    var text_sibling = form_parent.find('textarea');
			    var new_value = text_sibling.val();
			    $(this).parent().remove();
			    div_parent.show();
			}
    });
    textbox.hide();
    var itemField =$("<input/>").attr('type','hidden').attr('value', item_id).attr('name','item_id');
    var submitButton = $("<input/>").attr('type','button').attr('value','Modify');
    commentField.append(itemField);
    commentField.append(textField);

    submitButton.click(function(e) {
	var form_parent = $(this).parent().parent();
	var div_parent = form_parent.find(".static_div");
	var text_sibling = form_parent.find('textarea');
	var hidden_sibling = form_parent.find('input:hidden');
	item_id = hidden_sibling.val();
	var new_value = $(text_sibling).val();
        $(this).parent().remove();
        var display_value = new_value.replace(/\n/g,"<br>");
        div_parent.find(".content").html(display_value);
        div_parent.show();
	var on_done = imp.issue_loading(item_id, "editing");
        var response = $.ajax({type:"POST",
                url: url,
                data : { item_id: item_id, new_value: new_value },
                dataType:"json"});
	response.done( function() {
	    on_done();
	});
    });
    commentField.append(submitButton);
    textbox.parent().append(commentField);
    textField.focus();
    textField.value = textField.value;
};


imp.clickable_time_estimate = function(element, url, item_id, issue_id) {
    element = $(element).find("span.edit_issue_subject");
    var initial_value = element.find(".estimated_hours").html() || "0";
    return imp.clickable_subject_box(element, url, item_id, null, "auto", issue_id, initial_value=initial_value);
};

imp.clickable_subject_box = function(element, url, item_id, size, width, issue_id, initial_value) {

    // This 'imp.showing_clickable_popup' stuff can probably be removed, look for and delete all references if reading after 11Nov2013
    //
    // if ( imp.showing_clickable_popup ) {
    //     return;
    // }
    imp.showing_clickable_popup = true;

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

    commentTextArea = commentTextArea.attr("type","text").attr("value",value).attr("size",size).css("width",width).css("position","absolute").css("overflow","visible").css("z-index",200);
    textbox.parent().append(commentTextArea);
    textbox.hide();
    commentTextArea.select();
    commentTextArea = commentTextArea.keypress(function(e) {
        var parent = $(this).parent();
        var div_sibling = parent.find('.edit_issue_subject');
        var new_value = $(this).val();

        if (e.which === 13) {

            div_sibling.html(new_value);
            $(this).remove();
            div_sibling.show();
	    var on_done = imp.issue_loading(issue_id, "editing");
            var response = $.ajax({type:"POST",
                                   url: url,
                                   data : { item_id: item_id, new_value: new_value },
                                   dataType:"json"});
            response.done( function() {
		imp.refresh_closest_issue_parent_row(div_sibling);
		on_done();
	    } );
            imp.showing_clickable_popup = false;
        }

    });
    commentTextArea = commentTextArea.keyup(function(e) {
						e.stopImmediatePropagation();
						if(e.which === 27) {
						    var parent = $(this).parent();
						    var div_sibling = parent.find('.edit_issue_subject');
						    $(this).remove();
						    div_sibling.show();

						    imp.showing_clickable_popup = false;
						}
					    });
};


imp.refresh_closest_issue_parent_row = function(element) {
    var what = $(element);
    var closest_row = what.parents(".issue_instance_row");
    var url = closest_row.attr("refresh_url");
     $.ajax({type:"GET",
             url: url,
             success: function(data) {
                 $(closest_row)[0].outerHTML = $(data)[0].outerHTML;
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
    el.find(".existing_assign").hide();
    var form = el.find(".assign_user_form");
    form.show();

    form.find(".assign_button").click(function(event) {
					  event.stopImmediatePropagation();
					  var on_done = imp.issue_loading(issue_id, "assigning");
					  var value = form.find("[name='user_1']").val();

					  $.ajax({type:"POST",
						  url: update_url,
						  data : { issue_id: issue_id, user_id: value },
						  dataType:"json",
						  success: function() {
						      imp.refresh_closest_issue_parent_row(el);
						      on_done();
						  }});
				      });

    return false;
};

imp.show_inline_editor = function(el) {

    if ( imp.inline_editor_active ) {
	return;
    }
    imp.inline_editor_active = true;

    var td = $(el);
    var readonly_value = td.find(".readonly_value");
    var editor_container = td.find(".inline_editor");
    var editor = editor_container.find("select");
    var created_value_editor = editor_container.find("input");
    var url_for_update = td.attr("url_for_update");
    var url_for_options = td.attr("url_for_options");
    var old_value = editor.val();
    if ( ! old_value ) {
	old_value = td.attr("selected_value");
    }

    var deactivate_select = function() {
	imp.inline_editor_active = false;
	editor_container.hide();
	readonly_value.show();
    };

    var activate_select = function() {
	var issue_id = td.attr("issue_id");

	var on_changed = function() {
	    editor_container.hide();
	    var on_done = imp.issue_loading("saving issue");
	    var value = editor.val();
	    var response = $.ajax({type:"POST",
				   url: url_for_update,
				   data : { issue_id: issue_id, selected_value:value, created_value:created_value_editor.val() },
				   dataType:"json",
				   success: function() {
				       readonly_value.show();
				       editor_container.hide();
				       deactivate_select();
				       imp.refresh_closest_issue_parent_row(td);
				       on_done();
				   }
				  });
	};

	editor.change( on_changed );

	created_value_editor.keyup( function(event) {
					event.stopImmediatePropagation();
					if(event.which === 27) {
					    editor.val(old_value);
					    deactivate_select();
					}
					if(event.which === 13) {
					    on_changed();
					}
					return false;
				    });
	editor.keyup( function(event) {
			  event.stopImmediatePropagation();
			  if(event.which === 27) {
			      editor.val(old_value);
			      deactivate_select();
			  }
			  if(event.which === 13) {
			      on_changed();
			  }
			  return false;
		      });
	readonly_value.hide();
	editor_container.show();
    };

    if (url_for_options) {
	$.ajax({type:"GET",
		url: url_for_options,
		success: function(data) {
		    var new_option;
		    editor.html("");
		    $.each(data, function( index, value ) {
			       
			new_option = $("<option/>");
			new_option.attr("id", value[0]);
			new_option.text(value[1]);
			if (old_value == value[0]) {
			    new_option.attr("selected",true);
			}
			editor.append(new_option);
		    });
		    activate_select();
		}
	       });
    } else {
	activate_select();
    }

};

// imp.dynamic_option_selection = function(element, item_id, options , update_url) {
//     var selectme = $(element);
//     var id = null;
//     var d_options = {};
//     var i;

//     var editor = $(element).parents("td").find(".inline_editor").show();

//     for(i = 0; i < options.length; i++) {
//         d_options[options[i][0]] = options[i][1];
//     }

//     if (selectme.children('select').length == 0) {
//         var str ="";
//         var current_value = $.trim(selectme[0].innerHTML);
//         var new_select = $("<select/>").attr("class", "transient_selection");
// 	var new_option;
//         new_select.css("width","auto");
//         for (item in d_options)  {
//             new_option  = $("<option/>");
//             new_option.attr("id", item);
//             new_option.text(d_options[item]);
//             if (current_value == d_options[item]) {
//                 new_option.attr("selected",true);
//             }
//             new_select.append(new_option);
//         }
//         selectme.html("");
//         selectme.append(new_select);

//         $("select.selectbox").focus();
//         $("select.selectbox").blur(function() {
//             var value = $(this).val();
//             var valuetext = $(this).children('option#opt-'+value).text();
//             $("div.selectme").attr({'id': "selectme-"+value});
//             $(".selectme").text(valuetext);
//         });

//     }else {
//         var selected = selectme.find("option:selected");
//         var value = selected[0].innerHTML;
//         var response = $.ajax({type:"POST",
//                                url: update_url,
//                                data : { item_id: item_id , new_value:value, index: selected.attr("id") },
//                                dataType:"json"});

//         selectme.html('<div class="selectme">'+value+'</div>');
//         response.done( function() { imp.refresh_closest_issue_parent_row(selectme); } );
//     }
// };

