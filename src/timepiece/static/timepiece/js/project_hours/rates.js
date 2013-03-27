var TP_rates = function() {

    var trigger = null;
    var post_url = null;
    var project_name = null;
    var project_id = null;
    var user_name = null;

    var get_popup_node = function() {
	return $("#rates_editor_popup");
    };

    var on_save_done = function() {
	var node = get_popup_node();
	var new_rate = node.find(".rate_rate")[0].value;
	node.css("display", "none");
	$(trigger).parent().parent().find(".rate_amount").html(new_rate);

	var new_billable_rate = node.find(".rate_billable_rate")[0].value;
	node.css("display", "none");
	$(trigger).parent().parent().find(".billable_rate_amount").html(new_billable_rate);
    };

    var do_save_post = function(new_amount, new_billable_amount) {
	$.post(post_url,
	       {project_id:project_id,
		user_name:user_name,
		amount:new_amount,
	       billable_amount:new_billable_amount},
	       on_save_done);
    };

    return {
	show_editor : function(p_trigger, p_project_id, p_project_name, p_user_name, current_rate, current_billable_rate, p_post_url) {
	    var node = get_popup_node();
	    trigger = p_trigger;
	    post_url = p_post_url;
	    project_id = p_project_id;
	    project_name = p_project_name;
	    user_name = p_user_name;
	    node.find(".rate_username").html(user_name);
	    node.find(".rate_projectname").html(project_name);
	    node.find(".rate_rate")[0].value = current_rate;
	    node.find(".rate_rate").bind("keypress", function(e) {
					     if(e.which == 10 || e.which == 13) {
						 TP_rates.save();
					     }
					 });
	    node.find(".rate_billable_rate")[0].value = current_billable_rate;
	    node.find(".rate_billable_rate").bind("keypress", function(e) {
					     if(e.which == 10 || e.which == 13) {
						 TP_rates.save();
					     }
					 });
	    node.find(".loading").css("display", "none");
	    node.css("display", "block");
	    node.find(".rate_rate")[0].focus();
	    return false;
	},

	save : function() {
	    var node = get_popup_node();
	    do_save_post(node.find(".rate_rate")[0].value, node.find(".rate_billable_rate")[0].value);
	}
    };

}();

