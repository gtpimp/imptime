/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	eval("'use strict';\n\nmodule.exports = function (scriptName, done) {\n    var src = '\\n  // the prototype stuff is in case document.createElement has been modified\\n  var script = document.constructor.prototype.createElement.call(document, \\'script\\');\\n  script.src = \"' + scriptName + '\";\\n  document.documentElement.appendChild(script);\\n  script.parentNode.removeChild(script);\\n  ';\n\n    chrome.devtools.inspectedWindow.eval(src, function (res, err) {\n        if (err) {\n            console.log(err);\n        }\n        done();\n    });\n};//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvaW5qZWN0LmpzPzcwOWUiLCJ3ZWJwYWNrOi8vLz9kNDFkIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzY3JpcHROYW1lLCBkb25lKSB7XG4gICAgdmFyIHNyYyA9IGBcbiAgLy8gdGhlIHByb3RvdHlwZSBzdHVmZiBpcyBpbiBjYXNlIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaGFzIGJlZW4gbW9kaWZpZWRcbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNvbnN0cnVjdG9yLnByb3RvdHlwZS5jcmVhdGVFbGVtZW50LmNhbGwoZG9jdW1lbnQsICdzY3JpcHQnKTtcbiAgc2NyaXB0LnNyYyA9IFwiJHtzY3JpcHROYW1lfVwiO1xuICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgYDtcblxuICAgIGNocm9tZS5kZXZ0b29scy5pbnNwZWN0ZWRXaW5kb3cuZXZhbChzcmMsIGZ1bmN0aW9uKHJlcywgZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW5qZWN0LmpzXG4gKiovIiwidW5kZWZpbmVkXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogXG4gKiovIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUNDQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }
/******/ ]);