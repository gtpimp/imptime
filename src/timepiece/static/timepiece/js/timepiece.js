
$(document).ready(function() {


    $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
    $('.datetimepicker').datetimepicker({format: 'yyyy-mm-dd hh:ii', autoclose: true});

    var pane = $('table.fixed-header').parents('.pane')[0];
    //$('table.fixed-header').css({'max-height':(window.height-100)+'px'});
    $('table.fixed-header').stickyTableHeaders({'scrollableArea':pane});

});