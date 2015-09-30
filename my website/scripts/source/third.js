
//Encapsulating a file in a self-invoked function is not necessary, since Browserify encapsulates all required files in a scope.
//I do however still think we should to it in order to keep files clean if ever they are going to be used outside Browserify
(function() {
  'use strict';

  //here i require the lodash module, which i have installed with NPM.
  require('./first.js');
  var _ = require('lodash');

  //this is a constructor function that will enable us to construct types.
  module.exports = function (name) {
    //console.log('lodash, i can now use lodash in my class', _);
    var test = {};
    var privateFunc = function() {
    };

    this.somePublicFunc = function(text) {
      privateFunc();
      console.log('invoked "somePublicFunc" on ' + name + ' with:', text);
    }
  };
})();
