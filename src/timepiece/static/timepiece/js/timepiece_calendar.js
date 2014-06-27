
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
						      dayClick: t_calendar.on_day_clicked,
						      eventSources: [
							  { url: t_config.calendar_events_url,
							    color: 'lightblue',
							    textColor: 'black',
							    data: function() {
								var d = $(".filter_form").serializeArray();
								var res = {};
								$.each( d, function(index, datum) {
									    if (res[datum.name]) {
										res[datum.name] = [res[datum.name]];
										res[datum.name].push(datum.value);
									    } else {
										res[datum.name] = datum.value;
									    }
									});
								return res;
							    },
							    error: function() {
								alert("Failed to load calendar events");
							    }
							  }
						      ]
						      
						  });

		      $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
		      
		  });