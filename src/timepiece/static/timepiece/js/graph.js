
$(document).ready( function() {

		       var cumulative = 0;
		       var options = { xaxis: {
					   mode: "time",
					   timeformat: "%d %b %y"
				       }
				       // yaxis: {
				       // 	   transform: function (v) { 
				       // 	       if (cumulative < 100 ) {
				       // 		   cumulative += v;
				       // 	       }
				       // 	       return cumulative; 
				       // 	   }
				       // }
				     };
		       
		       $.plot($("#graph"), imp.data, options);
		   });


