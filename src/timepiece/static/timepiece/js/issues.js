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
		str += "<option style='background-color:blue' selected id='"+i+"' value='"+i+"'>"+arr[i][0]+"</option>";
	    else
		str += "<option style='background-color:red' value='"+i+"' id='"+i+"'>"+arr[i][0]+"</option>";
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




