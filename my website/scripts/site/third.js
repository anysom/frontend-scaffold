(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    console.log('ready');

    function someFunc(input) {
      var test;
      test = 7 + input;
      console.log('result of someFunc = ', test);
    }

    function third() {
      console.log('it works - even in third - first');
      console.log('it works - even in third');
      console.log('it works - even in third - and one more line');
      var output = 10;
      output = output + 1;
      someFunc(output);
    }

    var exp = true;
    if (exp) {
      someFunc(3);
      third();
    }
  });
})();
