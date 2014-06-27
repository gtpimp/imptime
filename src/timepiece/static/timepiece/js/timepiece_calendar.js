
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
			   },

			   refresh: function() {
			       $("#calendar").fullCalendar( 'refetchEvents' );
			   }

		       };

}());

$(document).ready(function() {

		      var active_loading_func = null;

		      var save_event = function(event, delta, revertFunc) {
			  var on_done = imp.loading("saving event...");
			  $.ajax({type:"POST",
				  url: t_config.update_calendar_event_url.replace("999999", event.id),
				  data: { start: event.start.format('YYYY-MM-DD HH:mm:ss'),
					  end: event.end.format('YYYY-MM-DD HH:mm:ss') },
				  success: function(data) {
				      on_done();
				  },
				  error: function(err) {
				      revertFunc();
				      on_done();
				      alert("Save failed");
				  }
				 });
		      };
		      
		      $('#calendar').fullCalendar({
						      header: {
							  left: 'prev,next today',
							  center: 'title',
							  right: 'month,agendaWeek,agendaDay'
						      },
						      defaultDate: '2014-06-12',
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
						      ],
						      editable: true,
						      eventDrop: save_event,
						      eventResize: save_event,
						      selectable: true,
						      selectHelper: true,
						      select: function(start, end) {
							  var title = prompt('Event Title:');
							  var eventData;
							  if (title) {
							      eventData = {
								  title: title,
								  start: start,
								  end: end
							      };
							      $('#calendar').fullCalendar('renderEvent', eventData, true);
							  }
							  $('#calendar').fullCalendar('unselect');
						      },
						      loading: function(isLoading, view) {
							  if ( isLoading ) {
							      active_loading_func = imp.loading("calendar loading");
							  } else {
							      if ( active_loading_func ) {
								  active_loading_func();
							      }
							  }
						      }
						      
						  });

		      $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
		      
		  });