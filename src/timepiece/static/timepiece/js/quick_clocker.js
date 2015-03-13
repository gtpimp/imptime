var qc = qc || {};

$(document).ready(function() {

    var refresh_current_time_interval;
    var refresh_current_time = function() {

        var currentdate = new Date();

        var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth()+1) 
                + "-" + currentdate.getDate() + " "
                + currentdate.getHours() + ":" 
                + currentdate.getMinutes();

        $("#id_clock_out_time").val(datetime);
    };

    refresh_current_time_interval = setInterval( refresh_current_time, 10*1000 );

    qc.cancel_refresh_current_time_refresh = function() {
        clearInterval(refresh_current_time_interval);
    };

    qc.filter_businesses = function(filter_string, filter_el) {
        filter_el.parent().find('div.button_radio_input').each( function() {
            if ( $(this).attr('label').indexOf(filter_string) > -1 ) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    };

    $("#id_clock_out_time").click(qc.cancel_refresh_current_time_refresh);

});