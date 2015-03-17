var scheduler = scheduler || {};

scheduler.on_set_schedule = function(input_el, user_id, business_id, url) {

    var form = $(input_el).parents('form');

    input_el.addClass('schedule_saving');
    input_el.removeClass('schedule_error');
    input_el.removeClass('schedule_saved');
    var response = $.ajax({type:"POST",
                           url: url,
                           dataType:"json",
                           data: { num_hours:input_el.val() },
                           success: function(data) {

                               $(".total_for_user_"+user_id).html(data['hours_for_user']);
                               $(".total_for_business_"+business_id).html(data['hours_for_business']);
                               $(".billable_for_user_"+user_id).html(data['billable_for_user']);
                               $(".billable_for_business_"+business_id).html(data['billable_for_business']);
                               $(".scheduled_total_hours").html(data['hours_total']);
                               $(".scheduled_total_billable").html(data['billable_total']);
                               
                               input_el.val(data.hours_captured);

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

$(document).ready(function() {



});