imp.nav = imp.nav || {};

imp.nav.hookup_search_form = function() {
    var form = $(".issue_search form");
    form.submit(function(event) {
		    event.stopImmediatePropagation();
		    
		    $.ajax({type:"GET",
			    url: form.attr('action'),
			    data: form.serialize(),
			    success: function(search_results) {
				$(".issue_search_results").html(search_results);
				imp.issue_search_results_dialog = $(".issue_search_results").dialog( { width: '75%', height: 500 } );
			    }
			   });

		    return false;
		});
};

imp.nav.show_business = function( business_id, show_url ) {

    var on_done = imp.loading("Finding...");
    if ( imp.active_business_id == business_id ) {
	imp.issue_search_results_dialog.dialog('close');
	imp.issue_search_results_dialog = null;
	on_done();
    } else {
	window.location = show_url;
    }

};

imp.nav.show_sprint = function(sprint_id, show_url) {
    var on_done = imp.loading("Finding...");
    var project = $("[list_project_id='"+sprint_id+"']");
    if ( project.length > 0 ) {

	imp.issue_search_results_dialog.dialog('close');
	imp.issue_search_results_dialog = null;

	project.show();
	project.scrollintoview();
	project.find(".project_expand").click();
	project.find(".project_detail").show();
	on_done();
    } else {
	window.location = show_url;
    }
};

imp.nav.show_issue = function( issue_id, project_id, show_url ) {

    var on_done = imp.loading("Finding...");
    var project = $("[list_project_id='"+project_id+"']");
    if ( project.length > 0 ) {

	imp.issue_search_results_dialog.dialog('close');
	imp.issue_search_results_dialog = null;

	project.show();
	project.scrollintoview();
	project.find(".project_expand").click();
	project.find(".project_detail").show();

	imp.highlight_issue(issue_id);
	on_done();

    } else {
	window.location = show_url;
    }
};

$(document).ready(function() {
		      imp.nav.hookup_search_form();
		  });

