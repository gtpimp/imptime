var imp = imp || {};

imp.show_issue_detail = function(url, issue_id) {
    $("loading").show();
    $(".issue_detail").load(url, function() {$("loading").hide();});
};

imp.toggle_form_show  = function(element) {
    var button = $(element);
    button.find(".to_click").hide()
    button.find(".to_edit").show()
};

imp.status_toggle_form_show = function(element,item_id,options,url) {
    var selectme = $(element);
    var id = null;
    var arr = new Array();
    lookup = {}
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
};

imp.ajax_call = function(element, url, item_id) {
    var button = $(element)
    $.ajax({type:"POST",
            url: url,
            data : { item_id: item_id },
            dataType:"json"});
    
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

    commentField = commentField.attr('action',url).attr('method','post');
    value = textbox.val("value")[0].innerText
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
    	form_parent = $(this).parent().parent();
    	div_parent = form_parent.find(".static_div");
    	text_sibling = form_parent.find('textarea');
    	hidden_sibling = form_parent.find('input:hidden');
    	item_id = hidden_sibling.val();
    	new_value = text_sibling.val();
	$(this).parent().remove();
	div_parent[0].innerText =new_value;
    	div_parent.show();
        $.ajax({type:"POST",
                url: url,
                data : { item_id: item_id, new_value: new_value },
                dataType:"json"});
    });
    commentField.append(submitButton);
    textbox.parent().append(commentField)    
};



imp.clickable_subject_box = function(element, url, item_id) {
    var textbox = $(element),
    commentTextArea = $("<input/>")
    commentTextArea = commentTextArea.attr("type","text").attr("value",textbox.html());
    textbox.parent().append(commentTextArea);
    textbox.hide();
    // commentTextArea = commentTextArea.css({ width: textbox.width(), 
    // 					    height: textbox.width(), });
    commentTextArea = commentTextArea.keypress(function(e) {
	if (e.which === 13) {
	    parent = $(this).parent();
	    div_sibling = parent.find('.edit_issue_subject');		    
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
	    div_sibling = parent.find('.edit_issue_subject');		    
	    $(this).remove();
	    div_sibling.show();          
	}
    });
};





