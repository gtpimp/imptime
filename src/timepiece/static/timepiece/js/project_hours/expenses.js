var validate_date = function(date){

    var validformat=/^\d{2}\/\d{2}\/\d{4}$/ //Basic check for format validity
    var returnval=true;
    var message = "";
    if (!validformat.test(date))
	message = "Invalid Date Format. Please correct and submit again.";
    else{ //Detailed check for valid date ranges
	var monthfield=date.split("/")[0]
	var dayfield=date.split("/")[1]
	var yearfield=date.split("/")[2]
	var dayobj = new Date(yearfield, monthfield-1, dayfield)
	if ((dayobj.getMonth()+1!=monthfield)||(dayobj.getDate()!=dayfield)||(dayobj.getFullYear()!=yearfield))
	    message = "Invalid date range detected. Please correct and submit again.";
	else
	    returnval=false;
    }
    return {errors: returnval, message: message};
}

var validate_amount = function(amount){
    amount = parseFloat(amount);
    if (isNaN(amount))
    {
	return {errors: true, message: "Invalid amount detected. Please correct and submit again"};
    }
    return {errors: false};
}

var validate_invoice_number = function(number){
    number = parseFloat(number);
    if (isNaN(number))
    {
	return {errors: true, message: "Invalid invoice number detected. Please correct and submit again"};
    }
    return {errors: false};
}

var validate_description = function(description){
    if (description.trim().length == 0)
    {
	return {errors: true, message: "Please enter a description (spaces are stripped)."};
    }
    return {errors: false};
}

var TP_expenses = function() {

    var trigger = null;
    var post_url = null;
    var project_name = null;
    var project_id = null;
    var user_name = null;

    var get_popup_node = function() {
	return $("#expense_editor_popup");
    };

    var on_save_done = function() {
	var node = get_popup_node();
	node.css("display", "none");
    };

    var do_save_post = function(date, amount, description) {
	var functions = [[validate_date, date], [validate_amount, amount], [validate_description, description]]
	var errors = {}
	for (i=0; i < functions.length; i++)
	{
	    errors = functions[i][0](functions[i][1]);
	    if (errors.errors)
	    {
		$("#expense_error_message").html(errors.message);
		return false;
	    }
	}
	$("#expense_error_message").html("")
	$.post(post_url,
	       {project_id:project_id,
	 	date:date,
	 	amount:amount,
	 	description: description,
	       },
	       on_save_done);
	return true;
    };

    return {
	show_editor : function(p_trigger, p_project_id, p_project_name, p_post_url) {
	    var node = get_popup_node();
	    trigger = p_trigger;
	    post_url = p_post_url;
	    project_id = p_project_id;
	    project_name = p_project_name;
	    node.find(".expense_title").html("Add expense: " + project_name);
	    node.css("display", "block");
	    return false;
	},

	save : function() {
	    var node = get_popup_node();
	    date = node.find('#id_date')[0];
	    amount = node.find('#id_amount')[0];
	    description = node.find('#id_description')[0];
	    if (do_save_post(date.value, amount.value, description.value.trim()))
	    {
		date.value = ""
		amount.value = ""
		description.value = ""
		$("#expense_error_message").html("");
	    }
	},

	cancel: function(){
	    var node = get_popup_node();
	    date = node.find('#id_date')[0].value = "";
	    amount = node.find('#id_amount')[0].value = "";
	    description = node.find('#id_description')[0].value = "";
	    $("#expense_error_message").html("");
	    node.css("display", "none");
	}
    };

}();

var TP_invoices = function() {

    var trigger = null;
    var post_url = null;
    var project_name = null;
    var project_id = null;
    var user_name = null;

    var get_popup_node = function() {
	return $("#invoice_editor_popup");
    };

    var on_save_done = function(data, textStatus, jqXHR) {
	var node = get_popup_node();
	node.css("display", "none");
    };

    var do_save_post = function(amount, date_paid, date_sent, description, invoice_number) {
	var functions = [[validate_amount, amount], [validate_description, description], 
			 [validate_invoice_number, invoice_number]]
	if (date_paid) //Dates can be empty.
	{
	    functions.push([validate_date, date_paid]);
	}
	
	if (date_sent)
	{
	    functions.push([validate_date, date_sent]);
	}
	var errors = {}
	for (i=0; i < functions.length; i++)
	{
	    errors = functions[i][0](functions[i][1]);
	    if (errors.errors)
	    {
		$("#invoice_error_message").html(errors.message);
		return false;
	    }
	}
	$("#invoice_error_message").html("")
	$.post(post_url,
	       {project_id:project_id,
	 	date_paid:date_paid,
	 	date_sent:date_sent,
	 	description: description,
		amount: amount,
		invoice_number: invoice_number,
	       },
	       on_save_done);
	return true;
    };

    return {
	show_editor : function(p_trigger, p_project_id, p_project_name, p_post_url) {
	    var node = get_popup_node();
	    trigger = p_trigger;
	    post_url = p_post_url;
	    project_id = p_project_id;
	    project_name = p_project_name;
	    node.find(".invoice_title").html("Add invoice: " + project_name);
	    node.css("display", "block");
	    return false;
	},

	save : function() {
	    var node = get_popup_node();
	    date_sent = node.find('#id_date_sent')[0];
	    date_paid = node.find('#id_date_paid')[0];
	    description = node.find('#id_description')[0];
	    amount = node.find('#id_amount')[0];
	    invoice_number = node.find('#id_invoice_number')[0];
	    if (do_save_post(amount.value, date_paid.value, date_sent.value, description.value.trim(), invoice_number.value))
	    {
		amount.value = ""
		date_sent.value = ""
		date_paid.value = ""
		description.value = ""
		invoice_number.value = ""
		$("#invoice_error_message").html("");
	    }
	},

	cancel: function(){
	    var node = get_popup_node();
	    node.find('#id_date_paid')[0].value = "";
	    node.find('#id_date_sent')[0].value = "";
	    node.find('#id_description')[0].value = "";
	    node.find('#id_invoice_number')[0].value = "";
	    node.find('#id_amount')[0].value = "";
	    $("#invoice_error_message").html("");
	    node.css("display", "none");
	}
    };

}();