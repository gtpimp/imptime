var imp = imp || {};

imp.show_issue_detail = function(url, issue_id) {
    $("loading").show();
    $(".issue_detail").load(url, function() {$("loading").hide();});
};

imp.do_form_show  = function(element, url) {
    var button = $(element);
    var to_click = $(button.find(".to_click"));
    var to_edit = $(button.find(".to_edit"));
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
    } 
};

imp.do_form_remove  = function(element) {
    var button = $(element);
    var to_click = $(button.find(".to_click"));
    var to_edit = $(button.find(".to_edit"));
    if (to_click.css("display") == 'none') {
        to_click.show()
        $(button.find(".new_issue_form_container")).remove()
        to_edit.hide()
    } 
};


imp.on_form_submit = function(element, url) {
    var mform = $(element);
    $.ajax({type:"POST",
            url: url,
            data: mform.serialize(),
            success:function(data) {
                var table_body = $(document).find(".issue_list_body");
                if(table_body.length > 0) {
                    table_body.append(data);
                }
            },
           });
    var button = mform.parent().parent().parent()
    imp.do_form_remove(button);    
    return false;
};

imp.status_toggle_form_show = function(element,item_id,options,url) {
    var selectme = $(element);
    var id = null;
    var arr = new Array();
    var lookup = {}
    for(i =0; i< options.length; i++) {
        arr.push(options[i])
        lookup[options[i][0]] = options[i][1]
    }
    
    if (selectme.children('select').length == 0) {
        
        var str = "";
        current_value = $.trim(selectme[0].innerHTML)
        for(i=0; i<arr.length; i++) {
            if (arr[i][0] == current_value) 
                str += "<option  selected id='"+i+"' value='"+i+"'>"+arr[i][0]+"</option>";
            else
                str += "<option  value='"+i+"' id='"+i+"'>"+arr[i][0]+"</option>";
        }
        
        str = "<select class='selectbox "+lookup[current_value]+"'>"+str+"</select>";
        
        selectme.html(str);
        
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
                url: url,
                data : { item_id: item_id , new_value:value },
                dataType:"json"});

        selectme.html('<div class="selectme '+lookup[value]+'">'+value+'</div>')
    }
    //imp.update_header_rows();
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
    	varnew_value = $(text_sibling).val();
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
    //imp.update_header_rows();
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
	    imp.update_header_rows();
            imp.showing_clickable_popup = false;
	}
	
    });
    commentTextArea = commentTextArea.keyup(function(e) {
	if(e.which === 27) {
	    var parent = $(this).parent();
	    var div_sibling = parent.find('.edit_issue_subject');		    
	    $(this).remove();
	    div_sibling.show();          
	    imp.update_header_rows();
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

// imp.update_header_rows = function() {
//     var table = $("table");
//     var content = $(".issue_list_body");
//     var content_row = $(".issue_list_body tr:last").find("td");

//     var specs = [];
//     content_row.each(function(index, element) {        
//         column = $(element);
//         specs.push({'width':column.css("width"),
//                     'padding-top':column.css("padding-top"),
//                     'padding-left':column.css("padding-left"),
//                     'padding-right':column.css("padding-right"),
//                     'padding-bottom':column.css("padding-bottom"),
//                    });

//     });

//     var header_rows =  $(".fixedHeader tr");
//     header_rows.each(function(index, header_row){
//         header_cells = $(header_row).find("th");
//         header_cells.each(function(index, cell) {
//             elem = $(cell);
//             new_width = specs[elem.index()]['width']
//             new_padding_top = specs[elem.index()]['padding-top']
//             new_padding_left = specs[elem.index()]['padding-left']
//             new_padding_right = specs[elem.index()]['padding-right']
//             new_padding_bottom = specs[elem.index()]['padding-bottom']
//             elem = elem.css("width",new_width);
//             elem = elem.css("padding-top",new_padding_top);
//             elem = elem.css("padding-left",new_padding_left);
//             elem = elem.css("padding-right",new_padding_right);
//             elem = elem.css("padding-bottom",new_padding_bottom);             
//         });
//     });
// };

// imp.update_body_rows = function() {
//     var table = $("table");
//     var content = $(".fixedHeader");
//     var content_row = $(".fixedHeader tr:first").find("th");

//     var specs = [];
//     content_row.each(function(index, element) {        
//         column = $(element);
//         specs.push({'width':column.css("width"),
//                     'padding-top':column.css("padding-top"),
//                     'padding-left':column.css("padding-left"),
//                     'padding-right':column.css("padding-right"),
//                     'padding-bottom':column.css("padding-bottom"),
//                    });

//     });

//     var body_rows =  $(".issue_list_body tr");
//     body_rows.each(function(index, header_row){
//         header_cells = $(header_row).find("td");
//         header_cells.each(function(index, cell) {
//             elem = $(cell);
//             new_width = specs[elem.index()]['width']
//             new_padding_top = specs[elem.index()]['padding-top']
//             new_padding_left = specs[elem.index()]['padding-left']
//             new_padding_right = specs[elem.index()]['padding-right']
//             new_padding_bottom = specs[elem.index()]['padding-bottom']
//             elem = elem.css("width",new_width);
//             elem = elem.css("padding-top",new_padding_top);
//             elem = elem.css("padding-left",new_padding_left);
//             elem = elem.css("padding-right",new_padding_right);
//             elem = elem.css("padding-bottom",new_padding_bottom);             
//         });
//     }); 
// }

imp.refresh_closest_issue_parent_row = function(element) {
    var what = $(element);
    var closest_row = what.closest(".issue_instance_row");
    var url = closest_row.attr("refresh_url");
     $.ajax({type:"GET",
             url: url,
             success: function(data) {
		 $(closest_row).html($(data).html())
           }
         });
};

imp.on_sortable_changed_for_url = function(sortable_url) {
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
	//imp.update_body_rows();
    };
    return ret_func;
}

imp.on_document_ready = function() {
    //imp.update_header_rows();
    var url = $(".issue_list_body").attr("update_order_url");
    
    $(".issue_list_body").sortable({ stop: imp.on_sortable_changed_for_url(url) });
}
$(document).ready(imp.on_document_ready);
