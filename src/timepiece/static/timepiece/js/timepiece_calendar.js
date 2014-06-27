
var t_calendar = ( function() {

		       return {

			   refresh: function() {
			       $("#calendar").fullCalendar( 'refetchEvents' );
			   },

			   update_event: function(el) {
			       var form = $(el).parents("form");
			       var data = t_calendar.serialize_form(form);
			       var on_done = (function() { 
						  var loading_done = imp.loading("saving event...");
						  return function() {
						      loading_done();
						      form.hide();
						      t_calendar.refresh();
						  };
					      }());

			       $.ajax({type:"POST",
				       url: t_config.update_calendar_event_url.replace("999999", data.event_id),
				       data: data,
				       success: function(data) {
					   on_done();
				       },
				       error: function(err) {
					   revertFunc();
					   on_done();
					   alert("Save failed");
				       }
				      });
			   },

			   delete_event: function(el) {
			       if ( ! confirm('Delete this event?') ) { 
				   return false; 
			       }; 
			       var form = $(el).parents("form");
			       var event_id = form.find("[name=event_id]").val();
			       var on_done = imp.loading("deleting event");
			       $.ajax({type:"POST",
				       url: t_config.delete_calendar_event_url.replace("999999", event_id),
				       success: function(data) {
					   on_done();
					   form.hide();
					   t_calendar.refresh();
				       },
				       error: function(err) {
					   on_done();
					   alert("Delete failed");
				       }
				      });
			       return false;
			   },

			   serialize_form: function(form_el) {
			       var d = form_el.serializeArray();
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
				      t_calendar.refresh();
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
			  var res = t_calendar.serialize_form($(".creation_form"));
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

		      var edit_event = function(calEvent, jsEvent, view) {

			  var form = $(".event_edit_form");
			  form.find("[name=user]").val(calEvent.user_id);
			  form.find("[name=project]").val(calEvent.project_id);
			  form.find("[name=hours]").val((calEvent.end-calEvent.start)/(60*60*1000));
			  form.find("[name=event_id]").val(calEvent.id);
			  form.show();
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
								return t_calendar.serialize_form($(".filter_form"));
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
						      eventClick: edit_event,
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
		      $('.datetimepicker').datetimepicker({format: 'yyyy-mm-dd hh:ii'});
		      
		  });