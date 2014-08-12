

aw.funcs = ( function() {

		 var funcs = {};


		 var set_product_triggers = function() {
		     hide_all_product_content();
		     $(".product .product_title").click( function(event) {
							     $(this).parent(".product").find(".product_content").slideToggle();
							 });
		     $(".process .process_title").click( function(event) {
							     $(this).parent(".process").find(".process_content").slideToggle();
							 });
		 };

		 var hide_all_product_content = function() {
		     $(".product .product_content").hide();
		 };

		 $(document).ready( function() {

					set_product_triggers();

				    });

		 return funcs;

}() );