imp.nav = imp.nav || {};

(function() {
  var loading_counter = 0;
  imp.loading = function(msg) {

      loading_counter += 1;
      var local_loading_counter = loading_counter;

      var el = $(".top_level_loading");
      el.find(".title").html(msg);
      el.show();

      var on_done = function() {
	  if (loading_counter == local_loading_counter) {
	      el.find(".title").html();
	      el.fadeOut({duration:1000});
	  }
      };
      return on_done;
  };
}());

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

imp.nav.hookup_noui_form = function() {
    var form = $(".noui_form form");
    form.submit(function(event) {
		    event.stopImmediatePropagation();
		    var on_done = imp.loading("parsing");
		    $.ajax({type:"POST",
			    url: form.attr('command'),
			    data: form.serialize(),
			    success: function(search_results) {
				on_done();
				$(".noui_results").html(search_results);
				imp.noui_results_dialog = $(".noui_results").dialog( { width: '75%', height: 500 } );
			    },
			    error: function(err) {
				on_done();
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
                      imp.nav.hookup_noui_form();
		  });

