
var t_calendar = ( function() {

		       

}());

$(document).ready(function() {
		      
		      $('#calendar').fullCalendar({
						      header: {
							  left: 'prev,next today',
							  center: 'title',
							  right: 'month,agendaWeek,agendaDay'
						      },
						      defaultDate: '2014-06-12',
						      editable: true,
						      events: t_config.calendar_events_url,
						      dayClick: function() {
							  alert('a day has been clicked!');
						      }
						  });
		      
		  });