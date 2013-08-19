var imp = imp || {};

imp.show_issue_detail = function(url, issue_id) {
    $("loading").show();
    $(".issue_detail").load(url, function() {$("loading").hide();});
};

imp.clickable_text_box = function(element, url, issue_id) {
    var button = $(element),
        commentField = $('<textarea/>');
    
    commentField
    .css({
            position: 'absolute',
            width: 200,
            height: 100,
            left: button.offset().left, 
             top: button.offset().top 
        })    
        .val(button.data('textContent') || button.html() )
        .keypress(function(e) {
            if (e.which === 13) {
                e.preventDefault();
                button.data('textContent', this.value);
                $(this).data($(this).val());
                button.html(button.data('textContent'));
                $.ajax({type:"POST",
                        url: url,
                        data : { issue_id: issue_id, new_description: button.data('textContent') },
                        dataType:"json"});
                $(this).remove();
            }
        })
        .appendTo(document.body);
};


