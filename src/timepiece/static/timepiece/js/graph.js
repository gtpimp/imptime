
$(document).ready( function() {

       // imp.data and imp.options are defined in graph.html
       //$.plot($("#graph"), imp.data, imp.options);
       //$.plot($("#bar_graph"), imp.bar_data, imp.bar_options);
     if (plot_charts) {
       for (var i = 0; i < plot_charts.length; i++) {
         $.plot($(plot_charts[i].divid), plot_charts[i].data, plot_charts[i].options);
       }
     }
});