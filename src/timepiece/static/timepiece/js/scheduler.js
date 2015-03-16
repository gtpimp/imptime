var scheduler = scheduler || {};

scheduler.on_set_schedule = function(input_el, url) {

    var form = $(input_el).parents('form');

    input_el.addClass('schedule_saving');
    input_el.removeClass('schedule_error');
    input_el.removeClass('schedule_saved');
    var response = $.ajax({type:"POST",
                           url: url,
                           data: { num_hours:input_el.val() },
                           success: function() {
                               input_el.removeClass('schedule_saving');
                               input_el.addClass('schedule_saved');
                               setInterval( function() { input_el.removeClass('schedule_saved'); }, 1000 );
                           },
                           error: function(err) {
                               input_el.removeClass('schedule_saving');
                               input_el.addClass('schedule_error');
                           }
                          });
    return false;
};

