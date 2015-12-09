/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Voice = require('ui/voice');

var main = new UI.Card({
    title: 'ImpTime',
    icon: 'images/menu_icon.png',
    subtitle: '',
    body: 'Press the button to start a command',
    subtitleColor: 'indigo', // Named colors
    bodyColor: '#9a0036', // Hex colors
    scrollable: true
});

main.show();

// main.on('click', 'up', function(e) {
//   var menu = new UI.Menu({
//     sections: [{
//       items: [{
//         title: 'Pebble.js',
//         icon: 'images/menu_icon.png',
//         subtitle: 'Can do Menus'
//       }, {
//         title: 'Second Item',
//         subtitle: 'Subtitle Text'
//       }]
//     }]
//   });
//   menu.on('select', function(e) {
//     console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
//     console.log('The item is titled "' + e.item.title + '"');
//   });
//   menu.show();
// });

var count = 0;

main.on('click', function(e) {

    console.log('Stopping any existing voice capture');
    Voice.dictate('stop');

    console.log("Updating subtitle");
    main.subtitle('Listening ' + count + '...');
    count += 1;

    // console.log('Starting new voice capture');
    // Voice.dictate('start', true, function(e) {
    //     console.log('Voice capture callback');
    //     if (e.err) {
    //         console.log('Error: ' + e.err);
    //         main.subtitle('Failed: ' + e.err);
    //         return;
    //     }

    //     main.subtitle('Success: ' + e.transcription);
    // });

    // var command = new UI.Card({
    //     title: 'Command',
    //     icon: 'images/menu_icon.png',
    //     subtitle: '',
    //     body: 'Speak',
    //     subtitleColor: 'indigo', // Named colors
    //     bodyColor: '#9a0036' // Hex colors
    // });

    // command.show();

    
});

//main.hide();

// main.on('click', 'down', function(e) {
//   var card = new UI.Card();
//   card.title('A Card');
//   card.subtitle('Is a Window');
//   card.body('The simplest window type in Pebble.js.');
//   card.show();
// });