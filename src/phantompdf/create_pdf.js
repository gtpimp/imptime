// based on http://tian-yi.me//convert-your-web-pages-to-pdf-files-using-phantomjs.html

//phantom.injectJs("../static/jquery.js");
var page, system, fs, info, csrftoken, sessionid, categories,notification, data, address, output;

// Create a page object
page = require('webpage').create();

// Require the system module so I can read the command line arguments
//system = require('system');

// Require the FileSystem module, so I can read the cookie file
fs = require('fs');

// Read the cookie file and split it by spaces
// Because the way I constructed this file, separate each field using spaces
// info = fs.read('/tmp/cookies.txt').split(' ');
// csrftoken = info[0];
// sessionid = info[1];


// Read the url and output file location from the command line argument
//url = system.args[1];
//output = system.args[2];
url = "http://localhost:8004";
output = "/home/gtp/temp/blah.pdf";

// Set the page size and orientation
page.paperSize = {
    format: 'A4',
    orientation: 'portrait'};

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
            $('body').css('background', 'none');
        }, data);

        // Now create the output file and exit PhantomJS
        page.render(output);
        phantom.exit();
    }
});
