(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    console.log('ready');

    function third() {
      console.log('it works - even in third - first');
      console.log('it works - even in third');
      console.log('it works - even in third - and one more line');
    }

    var exp = true;
    if (exp) {
      third();
    }
  });
})();
