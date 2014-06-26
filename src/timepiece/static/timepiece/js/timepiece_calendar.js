
var t_calendar = ( function() {

		       return {

			   on_day_clicked : function() {

			       $.ajax({type:"POST",
				       url: form.attr('action'),
				       data: form.serialize(),
				       success: function(data) {
					   var issue_number = data;
					   imp.refresh_issue_detail();
					   $(document).find(".issue_instance_row[id='"+issue_id+"']").find(".issue_number").html(issue_number);
				       }
				      });
			       
			       alert("hi");
			   }

		       };

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
						      dayClick: t_calendar.on_day_clicked
						  });

		      $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
		      
		  });