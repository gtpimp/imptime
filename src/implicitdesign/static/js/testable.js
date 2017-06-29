
var testable = ( function() {

    var change_exclusion_flag = function(url, callback) {
        var on_done = imp.loading("updating testable exclusion");
        $.ajax({type:"POST",
                url: url,
                dataType:"json",
                success : function (data) {
		    on_done();
                    callback();
                }
        });        
    }
    
    return {

        on_exclude_from_regression_test: function(event, el) {
            event.preventDefault();
            event.stopPropagation();
            url = $(el).attr('ajax_url');
            change_exclusion_flag(url, function() {
                window.location.reload();
            });
        },

        on_include_in_regression_test: function(event, el) {
            event.preventDefault();
            event.stopPropagation();
            url = $(el).attr('ajax_url');
            change_exclusion_flag(url, function() {
                window.location.reload();
            });
        }
    };
    
}());
