(function() {
  'use strict';

  function doManyThings(input) {
    return input * 3;
  }

  var exp = true;
  if (exp) {
    console.log('it works');
    var myStuff = doManyThings(7);
    console.log('it works', myStuff);
  }
})();

