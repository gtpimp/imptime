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

    $("#id_clock_out_time").click(qc.cancel_refresh_current_time_refresh);

});