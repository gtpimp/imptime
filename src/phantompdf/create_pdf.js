// based on http://tian-yi.me//convert-your-web-pages-to-pdf-files-using-phantomjs.html

//phantom.injectJs("../static/jquery.js");
var page, system, fs, info, csrftoken, sessionid, categories,notification, data, address, output;

// Create a page object
page = require('webpage').create();

// Require the system module so I can read the command line arguments
system = require('system');

// Read the url and output file location from the command line argument
url = system.args[1];
output = system.args[2];
static_url = system.args[3];

//url = "http://localhost:8005/timepiece/time-sheet/sprint_report/1301/?estimated=on&only_these_statuses=all&billable=on&preferred_user_for_estimates=3&preamble_type=billable&report_type=Quote&output_format=pdf&authenticate_token=6c1540ded7824130acb27a79af7c327e&authenticate_username=gtp";
//output = "/home/gtp/temp/blah2.pdf";

// Set the page size and orientation
page.paperSize = {
    format: 'A4',
    margin: '0px',
    orientation: 'portrait',
    header: {
	height: "1cm",
	contents: phantom.callback(function(pageNum, numPages) {

	    if ( pageNum == 1 ) {
		return "";
	    }

	    return '<div style="width:100%;height:60px;background-color: #4C4C4C; font-size:14px;color:#ffffff" class="header"><div style="margin-left:20px;">imptime <img width="75px" src="'+static_url+'images/implicitDesignLogo.jpg"/></div></div>';
	})
    },
    footer: {
	height: "1cm",
	contents: phantom.callback(function(pageNum, numPages) {
	    return '<div style="margin-top:10px; width:100%;height:60px;background-color: #4C4C4C; font-size:10px;color:#ffffff" class="header"><div style="float:left;">ImplicitDesign</div><div style="float:right;">info@implicitdesign.co.za  '+pageNum+'/'+numPages+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></div>';
	})
    }
};

// Now we have everything settled, let's render the page
page.open(url, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the url: ' + url);
        phantom.exit();
    } else {
        // If we are here, it means we rendered page successfully
        // Use "evaluate" method of page object to manipulate the web page
        // Notice I am passing the data into the function, so I can use
        // them on the page
        page.evaluate(function(data) {
        }, data);

        // Now create the output file and exit PhantomJS
        page.render(output);
        phantom.exit();
    }
});
