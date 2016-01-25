
var noui = (function() {

    var run_action = function(action) {
        action_completed(action);
        if ( action.action_type == "redirect" ) {
            window.location = action.action_args.url;
        } else if ( action.action_type == "javascript" ) {

            var func = new Function( action.action_args.func );
            func();
        } else {
            alert("Unknown action type: " + action.action_type);
        }
        
    };

    var action_completed = function(action, callback) {
        $.ajax({type:"POST",
                url: imp.config.noui_update_action_status_url.replace("999999", action.id),
                data: { new_status: 'completed' },
                success: function(data) {
                    if ( callback ) {
                        callback();
                    }
                },
                error: function(err) {
                    imp.on_error(err);
                }
               });
    };
    
    return {

        check_for_actions : function() {
            $.ajax({type:"GET",
                    url: imp.config.noui_next_action_url,
                    dataType:"json",
                    success : function (data) {
                        if ( data.action ) {
                            run_action(data.action);
                        }
                    },
                    error : function(err) {
                        imp.on_error(err);
                    }
           });    
        }

    };
    
}());

noui.hookup_noui_form = function() {
    var forms = $(".noui_form form");
    forms.submit(function(event) {
        var form = $(this);
	event.stopImmediatePropagation();
	var on_done = imp.loading("parsing");
	$.ajax({type:"POST",
		url: form.attr('action'),
		data: form.serialize(),
		success: function(results) {
		    on_done();
		    $(".noui_results").html(results);
		    imp.noui_results_dialog = $(".noui_results").dialog( { width: '75%', height: 500 } );
                    $(".noui_results").find("[name=command]").focus();
                    noui.check_for_actions();
		},
		error: function(err) {
		    on_done();
		}
	       });

	return false;
    });
};

$(document).ready(function() {
    noui.hookup_noui_form();
    noui.check_for_actions();
});
