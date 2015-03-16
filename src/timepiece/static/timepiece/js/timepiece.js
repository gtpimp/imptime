
$(document).ready(function() {


    $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
    $('.datetimepicker').datetimepicker({format: 'yyyy-mm-dd hh:ii', autoclose: true});


    $('table.fixed-header').stickyTableHeaders();

});