(function() {
  'use strict';

  console.log('this is first.js');

  function doManyThings(input) {
    return input * 3;
  }

  var exp = true;
  if (exp) {
    var myStuff = doManyThings(7);
    console.log('first.js: doManyThings', myStuff);
  }
})();

