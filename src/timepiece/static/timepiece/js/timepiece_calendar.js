
jQuery.ajaxSettings.traditional = true;

var t_calendar = ( function() {

		       return {

			   refresh: function() {
			       $("#calendar").fullCalendar( 'refetchEvents' );
			       t_calendar.refresh_sprint_schedules();
			   },

			   activate_project_for_scheduling: function(project_id) {
			       $("#id_project").val(project_id);
			   },

			   refresh_sprint_schedules: function() {
			       var on_done = imp.loading("calculating...");
			       $(".sprint_schedules").html("...");
			       $.ajax({type:"GET",
				       url: t_config.render_calendar_scheduled_sprints_url,
				       success: function(data) {
					   on_done();
					   $(".sprint_schedules").html(data);
					   $(".tooltip_anchor").hover(function() {
									  $(this).parents("li").find(".hover_tooltip").show();
								      },
								      function() {
									  $(this).parents("li").find(".hover_tooltip").hide();
								      });

				       },
				       error: function(err) {
					   on_done();
					   alert("Fetch failed");
				       }
				      });
			   },

			   update_event: function(el) {
			       var form = $(el).parents("form");
			       var data = t_calendar.serialize_form(form);
			       var on_done = (function() {
						  var loading_done = imp.loading("saving event...");
						  return function() {
						      loading_done();
						      form.hide();
						  };
					      }());

			       $.ajax({type:"POST",
				       url: t_config.update_calendar_event_url.replace("999999", data.event_id),
				       data: data,
				       dataType:"json",
				       success: function(data) {
					   on_done();
					   t_calendar.refresh();
				       },
				       error: function(err) {
					   on_done();
					   alert("Save failed");
				       }
				      });
			   },

			   create_event: function(el) {

			       var form = $(".event_create_form");
			       var res = t_calendar.serialize_form(form);
			       
			       if ( ! res.user ) {
				   alert("Select a user before trying to create events");
				   return false;
			       }

			       var on_done = (function() {
						  var loading_done = imp.loading("creating event...");
						  return function() {
						      loading_done();
						      form.hide();
						  };
					      }());

			       $.ajax({type:"POST",
				       url: t_config.create_calendar_event_url,
				       data: res,
				       dataType:"json",
				       success: function(data) {
					   on_done();
					   $("#calendar").fullCalendar('renderEvent', data);
				       },
				       error: function(err) {
					   on_done();
					   alert("Create failed");
				       }
				      });
			       return false;

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
					   if (res[datum.name] ) {
					       if ( ! $.isArray(res[datum.name]) ) {
						   res[datum.name] = [res[datum.name]];
					       }
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

		      var save_event = function(event, delta, revertFunc, needs_refresh) {
			  var on_done = imp.loading("saving event...");

			  var data = { start: event.start.format('YYYY-MM-DD HH:mm:ss'),
				       end: event.end.format('YYYY-MM-DD HH:mm:ss') };
			  if ( event.project_id ) {
			      data.project = event.project_id;
			  }

			  $.ajax({type:"POST",
				  url: t_config.update_calendar_event_url.replace("999999", event.id),
				  data: data,
				  dataType:"json",
				  success: function(data) {
				      on_done();
				      if ( needs_refresh ) {
					  t_calendar.refresh();
				      }
				  },
				  error: function(err) {
				      revertFunc();
				      on_done();
				      alert("Save failed");
				  }
				 });
		      };

		      var new_event = function(start, end, jsEvent, view) {
			  var form = $(".event_create_form");
			  form.find("[name=start]").val(start.format('YYYY-MM-DD HH:mm:ss'));
			  form.find("[name=end]").val(end.format('YYYY-MM-DD HH:mm:ss'));
			  form.show();
		      };

		      var edit_event = function(calEvent, jsEvent, view) {

			  var form = $(".event_edit_form");
			  form.find("[name=user]").val(calEvent.user_id);
			  form.find("[name=project]").val(calEvent.project_id);
			  form.find("[name=hours]").val((calEvent.end-calEvent.start)/(60*60*1000));
			  form.find("[name=description]").val(calEvent.description);
			  form.find("[name=event_type]").val(calEvent.event_type);
			  form.find("[name=event_id]").val(calEvent.id);
			  form.find("[name=start]").val(calEvent.start.format('YYYY-MM-DD HH:mm:ss'));
			  form.find("[name=end]").val(calEvent.end.format('YYYY-MM-DD HH:mm:ss'));

			  if ( ! calEvent.editable ) {
			      form.find(".event_edit_button").hide();
			      form.find(".edit_msg").html("This event can't be updated");
			  } else {
			      form.find(".event_edit_button").show();
			      form.find(".edit_msg").html("");
			  }    

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
						      eventDrop: function(event, delta, revertFunc) { save_event(event, delta, revertFunc, false); },
						      eventResize: function(event, delta, revertFunc) { save_event(event, delta, revertFunc, true); },
						      selectable: true,
						      selectHelper: true,
						      select: new_event,
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

		      t_calendar.refresh_sprint_schedules();

		  });