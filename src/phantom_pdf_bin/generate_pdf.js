var page, system, fs, info, csrftoken, sessionid, categories,
    notification, data, address, output, api_token, domain, cookie_file;

// Create a page object
page = require('webpage').create();

// Require the system module so I can read the command line arguments
system = require('system');

// Require the FileSystem module, so I can read the cookie file
fs = require('fs');

// Read the url and output file location from the command line argument
// Read the cookie file and split it by spaces
// Because the way I constructed this file, separate each field using spaces
address = system.args[1];
output = system.args[2];
cookie_file = system.args[3];
domain = system.args[4];
static_url = system.args[5];

info = JSON.parse(fs.read(cookie_file));
var headers = info.headers;
cookies = info.cookies;
csrftoken = info[0];
sessionid = info[1];

phantom.customHeaders = headers;

if (headers['USER_AGENT'])
{
    page.settings.userAgent = headers['USER_AGENT'];
}

Object.keys(cookies).forEach(function(cookie) {
    phantom.addCookie({
        'domain': domain,
        'name': cookie,
        'value': cookies[cookie]
    });
});

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

	    return '<div style="width:100%;height:60px;background-color: #4C4C4C; font-size:14px;color:#ffffff" class="header"><div style="margin-left:20px;">ImplicitDesign<img width="75px" src="'+static_url+'images/implicitDesignLogo.jpg"/></div></div>';
	})
    },
    footer: {
	height: "1cm",
	contents: phantom.callback(function(pageNum, numPages) {
	    return '<div style="margin-top:10px; width:100%;height:60px;background-color: #4C4C4C; font-size:10px;color:#ffffff" class="header"><div style="float:left;">ImplicitDesign</div><div style="float:right;">info@implicitdesign.co.za  '+pageNum+'/'+numPages+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></div>';
	})
    }
};

// page.viewPortSize  = {width: 1024, height: 1000};
page.zoomFactor = 1;

// Now we have everything settled, let's render the page
page.open(address, function (status) {
    if (status !== 'success') {
        // If PhantomJS failed to reach the address, print a message
        console.log('Unable to load the address!');
        phantom.exit();
    } else {
        // If we are here, it means we rendered page successfully
        // Use "evaluate" method of page object to manipulate the web page
        // Notice I am passing the data into the function, so I can use
        // them on the page
	window.setTimeout(function () {
	    page.render(output);
	    phantom.exit();
	}, 200);
    }
});

