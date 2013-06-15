
var imp = imp || {};

imp.project_card_thinking = function(el) {
  $(el).parents(".project_card").find(".loading").show();
};

imp.popup_page = function(url) {

  $(".project_card_dialog_container").dialog( { open: function(event, ui) {
						    $(".project_card_dialog_container").find(".dialog_content").load(url);
						},
						close: function(ev, ui) {
						    $(this).remove();
						}
					      });
						  
};

