
imp.on_error = function(err) {
    var err_msg;
    if  ( err.statusText ) {
        err_msg = err.status + " " + err.statusText;
    } else {
        err_msg = err;
    }
    alert(err_msg);
};

$(document).ready(function() {

    $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
    $('.datetimepicker').datetimepicker({format: 'yyyy-mm-dd hh:ii', autoclose: true});

    var pane = $('table.fixed-header').parents('.pane')[0];
    //$('table.fixed-header').css({'max-height':(window.height-100)+'px'});
    $('table.fixed-header').stickyTableHeaders({'scrollableArea':pane});

});