
var t_calendar = ( function() {

		       return {

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

		      var create_event = function(start, end, jsEvent, view) {

			  var on_done = imp.loading("creating event...");
			  var d = $(".creation_form").serializeArray();
			  var res = {};
			  $.each( d, function(index, datum) {
				      if (res[datum.name]) {
					  res[datum.name] = [res[datum.name]];
					  res[datum.name].push(datum.value);
				      } else {
					  res[datum.name] = datum.value;
				      }
				  });
			  res.start = start.format('YYYY-MM-DD HH:mm:ss');
			  res.end = end.format('YYYY-MM-DD HH:mm:ss');
			  
			  $.ajax({type:"POST",
				  url: t_config.create_calendar_event_url,
				  data: res,
				  success: function(data) {
				      on_done();
				      t_calendar.refresh();
				  },
				  error: function(err) {
				      revertFunc();
				      on_done();
				      alert("Create failed");
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
						      select: create_event,
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