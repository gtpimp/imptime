var requireDir = require('require-dir');

requireDir('./gulp/tasks', { recurse: true });


// build-react should get collected static up to date
//build and watch csss and images