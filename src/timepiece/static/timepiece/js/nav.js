imp.nav = imp.nav || {};

imp.nav.show_issue_search_results = function() {

    alert("done");

};

$(document).ready(function() {

		      var form = $(".issue_search form");
		      form.submit(function(event) {
				      event.stopImmediatePropagation();
				      
				      $.ajax({type:"POST",
					      url: form.attr('action'),
					      data: form.serialize(),
					      success: function(search_results) {
						  $(".issue_search_results").html(search_results);
						  $(".issue_search_results").dialog( { width: 600, height: 400 } );
					      }
					     });

				      return false;
				  });
		  });

