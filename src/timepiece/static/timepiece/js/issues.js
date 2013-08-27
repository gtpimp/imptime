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
    
    if (selectme.children('select').length == 0) {
	
	var str = "";
	
	var arr = new Array();
	for(i =0; i< options.length; i++) {
	    arr.push(options[i])
	}
	
	current_value = $.trim(selectme[0].innerHTML)
	for(i=0; i<arr.length; i++) {
	    if (arr[i] == current_value) 
		str += "<option selected id='"+i+"' value='"+i+"'>"+arr[i]+"</option>";
	    else
		str += "<option value='"+i+"' id='"+i+"'>"+arr[i]+"</option>";
	}
	
	str = "<select class='selectbox'>"+str+"</select>";
	
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

	selectme.html('<div class="selectme">'+value+'</div>')
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
    var button = $(element),
        commentField = $('<textarea/>');
    
    commentField
    .css({
            position: 'absolute',
            width: 200,
            height: 100,
            left: button.offset().left, 
             top: button.offset().top 
        })    
        .val(button.data('textContent') || button.html() )
        .keypress(function(e) {
            if (e.which === 13) {
                e.preventDefault();
                button.data('textContent', this.value);
                $(this).data($(this).val());
                button.html(button.data('textContent'));
                $.ajax({type:"POST",
                        url: url,
                        data : { item_id: item_id, new_value: button.data('textContent') },
                        dataType:"json"});
                $(this).remove();
            }
        })
        .appendTo(document.body);
};




