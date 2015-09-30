(function() {
  'use strict';
  console.log('this is app.js!');

  //require the script first.js
  //first is just a close self-invoked function. As that the variable first does not really
  //get to contain anything usefull.
  //The only thing that happens is that we ensure that first.js will run before this script
  //is executed.
  require('./first.js');

  //second.js exposes a module definition, and therefore the variable second will get to
  //contain an instance of that module.. YES!! :D
  var second = require('./second.js');


  //BUT BUT BUT, if you inspect second.js, you will see that it is just a simple function.
  //Thats a bit boring....
  //third.js exposes a constructor function we can use to instantiate classes.
  //remember it is a good convention to store constructor functions in a variable with
  //a capitalized first letter..
  var Third = require('./third.js');
  
  window.onerror = function(e) {
    console.log('error', e);
  }


  console.log('lets try out the required second module', second(6));

  var thirdInstanceOne = new Third('Third1');
  var thirdInstanceTwo = new Third('Third2');
  var thirdInstanceThree = new Third('Third3');

  thirdInstanceOne.somePublicFunc('fest');
  thirdInstanceTwo.somePublicFunc('hos');
  thirdInstanceThree.somePublicFunc('mange');
})();
