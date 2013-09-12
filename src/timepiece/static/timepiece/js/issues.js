var imp = imp || {};

imp.show_issue_detail = function(element, url, issue_id) {    
    $("loading").show();
    var closest_issue_detail_for_this_table = $(element).closest(".row-fluid").find(".issue_pane .issue_detail");
    closest_issue_detail_for_this_table.load(url, function() {$("loading").hide();});
 };

imp.do_form_show  = function(element, url) {
    var button = $(element);
    var parent = button.parent().parent(); 
    var to_click = $(parent.find(".to_expand_form_on_click"));
    var to_edit = $(parent.find(".to_edit_expanded_form"));
    if (to_click.css("display") != 'none') {
        to_click.hide()
        
        $.ajax({type:"GET",
                url: url,
                success: function(data) {
                    to_edit.append($(data))
                }
               });
        
        to_edit.show()
        to_edit.css("z-index",200);
        function key_up_for_form(form) {
           var current_form = form;
           return function(event) {
               if(event.which === 27) {    
                   imp.do_form_remove(current_form);
               }
           }
        };
        to_edit.keyup( key_up_for_form(parent) );
    } 
};


imp.close_add_issue = function (element) {
    var parent_form = $(element).closest(".parent_li_of_form_on_click");
    imp.do_form_remove(parent_form);
    return false;
}

imp.do_form_remove  = function(element) {
    var button = $(element);
    var to_click = $(button.find(".to_expand_form_on_click"));
    var to_edit = $(button.find(".to_edit_expanded_form"));
    if (to_click.css("display") == 'none') {
        to_click.show()
        $(button.find(".new_issue_form_container")).remove()
        to_edit.hide()
    } 
    return false;
};


imp.on_form_submit = function(element, url) {
    var mform = $(element);
    function handle_success_for_form(form) {
          var a_form = form;
          return function(data) {
                var table_body =  a_form.closest(".project_detail").find(".issue_list_body")
                if(table_body.length > 0) {
                    table_body.append(data);
                }
              var button = a_form.parent().parent().parent()
              imp.do_form_remove(button);    
          }
    }
    var response = $.ajax({type:"POST",
                           url: url,
                           data: mform.serialize(),
                          });
    response.done( handle_success_for_form(mform) );
    return false;
};

imp.ajax_call = function(element, url, item_id) {
    var button = $(element);
    $.ajax({type:"POST",
            url: url,
            data : { item_id: item_id },
            dataType:"json"});
    
};

imp.delete_issue_from_issues_list = function(element, url, item_id) {
    var button = $(element);
    var closest_row = button.closest(".issue_instance_row");
    var loading_el = $(".loading_issue_"+item_id);
    loading_el.show();
    $.ajax({type:"POST",
            url: url,
            data : { item_id: item_id },
            dataType:"json",
            success: function() {
                loading_el.hide();
                closest_row.remove();
            }});
    
};

imp.clickable_text_box = function(element, url, item_id) {
    var textbox = $(element),
    commentField = $('<form/>');
    
    commentField = commentField.attr('action',url).attr('method','post');
    textField =$("<input/>").attr('type','text').attr('name','new_value').attr('value',textbox.html());
    textbox.hide();
    itemField =$("<input/>").attr('type','hidden').attr('value', item_id).attr('name','item_id');
    submitButton = $("<input/>").attr('type','button').attr('value','Submit');
    commentField.append(itemField);
    commentField.append(textField);
    commentField.append(submitButton);
    textbox.parent().append(commentField)    
    submitButton.click(function(e) {  
        form_parent = $(this).parent();
        div_parent = form_parent.parent().find('.edit_issue_subject');         
        text_sibling = form_parent.find('input:text');
        hidden_sibling = form_parent.find('input:hidden');
        item_id = hidden_sibling.val()
        new_value = text_sibling.val();
        form_parent.remove();
        div_parent.html(new_value);
        div_parent.show();
        $.ajax({type:"POST",
                url: url,
                data : { item_id: item_id, new_value: new_value },
                dataType:"json"});
    });

};


imp.clickable_description_box = function(element, url, item_id) {
    var textbox = $(element),
    commentField = $('<form/>');

    var commentField = commentField.attr('action',url).attr('method','post');
    value = textbox.html()
    value = value.replace(/<br>/g,"\n")
    textField =$("<textarea/>").attr('name','new_value').attr('value',value);
    textField.keyup(function(e) {
        if(e.which === 27) {    
            form_parent = $(this).parent().parent();
            div_parent = form_parent.find(".static_div");
            text_sibling = form_parent.find('textarea');      
            new_value = text_sibling.val();
            $(this).parent().remove();
            div_parent.show();        
        }
    });
    textbox.hide();
    itemField =$("<input/>").attr('type','hidden').attr('value', item_id).attr('name','item_id');
    submitButton = $("<input/>").attr('type','button').attr('value','Modify');
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
        $(div_parent[0]).html(display_value);
            div_parent.show();
        $.ajax({type:"POST",
                url: url,
                data : { item_id: item_id, new_value: new_value },
                dataType:"json"});
    });
    commentField.append(submitButton);
    textbox.parent().append(commentField);
};


imp.clickable_time_estimate = function(element, url, item_id, size) {
    element = $(element).find(".edit_issue_subject");
    return imp.clickable_subject_box(element, url, item_id, size);
};

imp.clickable_subject_box = function(element, url, item_id, size) {

    if ( imp.showing_clickable_popup ) {
        return;
    }
    imp.showing_clickable_popup = true;

    var textbox = $(element),
        commentTextArea = $("<input/>");
    var value = $.trim(textbox.html()); 
    size = size || value.length;
    commentTextArea = commentTextArea.attr("type","text").attr("value",value).attr("size",size).css("width","auto").css("position","absolute").css("overflow","visible");
    textbox.parent().append(commentTextArea);
    textbox.hide();
    commentTextArea = commentTextArea.keypress(function(e) {
        var parent = $(this).parent();
        var div_sibling = parent.find('.edit_issue_subject');                    
        var new_value = $(this).val();

        if (e.which === 13) {
            imp.refresh_closest_issue_parent_row(div_sibling);
            div_sibling.html(new_value);
            $(this).remove();
            div_sibling.show();
            $.ajax({type:"POST",
                    url: url,
                    data : { item_id: item_id, new_value: new_value },
                    dataType:"json"});
            
            imp.showing_clickable_popup = false;
        }
        
    });
    commentTextArea = commentTextArea.keyup(function(e) {
        if(e.which === 27) {
            var parent = $(this).parent();
            var div_sibling = parent.find('.edit_issue_subject');                    
            $(this).remove();
            div_sibling.show();          

            imp.showing_clickable_popup = false;
        }
    });
};


imp.clickable_point_box = function(element, url, item_id) {
    var textbox = $(element),
        commentTextArea = $("<input/>");
    commentTextArea = commentTextArea.attr("type","text").attr("value",textbox.html());
    textbox.parent().append(commentTextArea);
    textbox.hide();

    commentTextArea = commentTextArea.keypress(function(e) {
        if (e.which === 13) {
            parent = $(this).parent();
            div_sibling = parent.find('.edit_issue_points');
            new_value = $(this).val();
            div_sibling.html(new_value);
            $(this).remove();
            div_sibling.show();
            $.ajax({type:"POST",
                    url: url,
                    data : { item_id: item_id, new_value: new_value },
                    dataType:"json"});

        }
    });
    commentTextArea = commentTextArea.keyup(function(e) {
        if(e.which === 27) {
            parent = $(this).parent();
            div_sibling = parent.find('.edit_issue_points');                      
            $(this).remove();
            div_sibling.show();          
        }
    });
};


imp.refresh_closest_issue_parent_row = function(element) {
    var what = $(element);
    var closest_row = what.closest(".issue_instance_row");
    var url = closest_row.attr("refresh_url");
     $.ajax({type:"GET",
             url: url,
             success: function(data) {
                 $(closest_row)[0].outerHTML = $(data)[0].outerHTML;
           }
         });
};


imp.ask_for_business_features = function (url) {
    return 
};


imp.ajax_selection = function(element, url, update_url) {

    var handle_ajax_data_given = function (element , update_url) {
        var _update_url = update_url;
        var _element = element;
        var item_id = $(element).attr("id");
        function new_data_handler (data) {
            var selection_val ="nothing";
            if (data.length) {
             selection_val= data[0][0]
            }
            imp.dynamic_option_selection(_element, item_id, data, update_url);
        }
        return new_data_handler;
    };

    var response = $.ajax({ type:"GET",
                            url: url,
                          });

    response.done( handle_ajax_data_given (element, update_url) );

};


imp.select_business_feature = function(element, item_id, request_url, update_url) {

    var response = $.ajax( { type: "GET",
                             url : request_url,
                           });
    
    var create_widget_at_done = function (element, item_id, update_url) {
        var _element = element;
        var _update_url = update_url;
        var _item_id = item_id;
        return function (data) {
            imp.dynamic_option_selection(_element, item_id, data, update_url);
        }
    };
    response.done( create_widget_at_done(element, item_id,  update_url) );
  
};

imp.dynamic_option_selection = function(element, item_id, options , update_url) {
    var selectme = $(element);
    var id = null;
    var d_options = {}
    
    for(i = 0; i < options.length; i++) {
        d_options[options[i][0]] = options[i][1];
    }
    
    if (selectme.children('select').length == 0) {
        var str ="";
        current_value = $.trim(selectme[0].innerHTML)
        new_select = $("<select/>").attr("class", "transient_selection");
        new_select.css("width","auto");
        for (item in d_options)  {
            new_option  = $("<option/>");
            new_option.attr("id", item);
            new_option.text(d_options[item]);
            if (current_value == d_options[item]) {
                new_option.attr("selected",true);               
            }
            new_select.append(new_option);
        }
        selectme.html("");
        selectme.append(new_select);
        
        $("select.selectbox").focus();
        $("select.selectbox").blur(function() {
            var value = $(this).val();            
            var valuetext = $(this).children('option#opt-'+value).text();            
            $("div.selectme").attr({'id': "selectme-"+value});            
            $(".selectme").text(valuetext);
        });
        
    }else {
        selected = selectme.find("option:selected")
        value = selected[0].innerHTML
        $.ajax({type:"POST",
                url: update_url,
                data : { item_id: item_id , new_value:value, index: selected.attr("id") },
                dataType:"json"});

        selectme.html('<div class="selectme">'+value+'</div>')
        imp.refresh_closest_issue_parent_row(selectme);
    }
};

