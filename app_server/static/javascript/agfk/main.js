/**
 * Main function, set to data-main with require.js
 */

// configure require.js
requirejs.config({
  baseUrl: window.STATIC_PATH + "javascript",
  paths: {
    jquery:"lib/jquery-2.0.3.min",
    "jquery.cookie": "lib/jquery.cookie",
    underscore: "lib/underscore-min",
    backbone: "lib/backbone-min",
    d3: "lib/d3",
    "btouch": "lib/backbone.touch"
  },
  shim: {
    d3: {
      exports: "d3"
    },
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    "jquery.cookie"  : {
      deps: ["jquery"]
    },
    "btouch" : {
      deps: ["jquery", "underscore", "backbone"]
    }
  },
  waitSeconds: 15
});

/**
 * Handle uncaught require js errors -- this function is a last resort
 * TODO: anyway to reduce code repetition with other js files, considering the other js files won't be loaded?
 * perhaps define a global namespace of css classes and ids?
 */
if (window.PRODUCTION){
  requirejs.onError = function(err){
    var errorId = "error-message";
    if (document.getElementById(errorId) === null){
      var div = document.createElement("div");
      div.id = errorId;
      div.className = "app-error-wrapper"; // must also change in error-view.js
      div.textContent = "Sorry, it looks like we encountered a problem trying to " +
        "initialize the application. Refreshing your browser may solve the problem.";
      document.body.appendChild(div);
    }
    throw new Error(err.message);
  };
}

// Usage: 
//
// 1. Put this in the file that gets first loaded by RequireJS
// 2. Once the page has loaded, type window.rtree.map() in the console
//    This will map all dependencies in the window.rtree.tree object
// 3. To generate UML call window.rtree.toUml(). The output can be used
//    here: http://yuml.me/diagram/scruffy/class/draw
requirejs.onResourceLoad = function (context, map, depMaps) {
  if (!window.rtree) {
    window.rtree = {};
    window.rtree.tree = {};
    window.rtree.map = function() {
      var dep, key, rt, val, _i, _len, _ref;
      rt = window.rtree.tree;
      for (key in rt) {
	val = rt[key];
	if (rt.hasOwnProperty(key)) {
	  _ref = val.deps;
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	    dep = _ref[_i];
	    val.map[dep] = rt[dep];
	  }
	}
      }
    };
    window.rtree.toUml = function() {
      var dep, key, rt, uml, val, _i, _len, _ref;
      rt = window.rtree.tree;
      uml = [];
      for (key in rt) {
	val = rt[key];
	if (rt.hasOwnProperty(key)) {
	  _ref = val.deps;
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	    dep = _ref[_i];
	    uml.push("[" + key + "]->[" + dep + "]");
	  }
	}
      }
      return uml.join("\n");
    };

  }
  r = window.rtree.tree;
  o = {deps: [], map: {}};
  if (!r[map.name]) {
    r[map.name] = o;
  }
  if (map.parentMap && map.parentMap.name) {
    if (!r[map.parentMap.name]) {
      r[map.parentMap.name] = o;
    }
    if (map.parentMap.name !== map.name) {
      r[map.parentMap.name].deps.push(map.name);
    }
  }
};

// agfk app & gen-utils
requirejs(["backbone", "agfk/utils/utils", "agfk/routers/router", "gen-utils", "jquery", "jquery.cookie", "btouch"], function(Backbone, Utils, AppRouter, GenPageUtils, $){
  "use strict";

  // shim for CSRF token integration with backbone and django
  var oldSync = Backbone.sync;
  Backbone.sync = function(method, model, options){
    options.beforeSend = function(xhr){
      if (model.get("useCsrf")){
        xhr.setRequestHeader('X-CSRFToken', window.CSRF_TOKEN);
      }
    };
    return oldSync(method, model, options);
  };
  
  GenPageUtils.prep();
  
  // automatically resize window when viewport changes
  Utils.scaleWindowSize("header", "main");

  // log internal and external views (piwik won't track if the client has donottrack set)
  $("body").on("click", "a.external-link", function(evt){
    if(window._paq){
      window._paq.push(['trackLink', evt.currentTarget.href, "link"]);
    }
  });
  $(window).on('hashchange', function() {
    if(window._paq){
      window._paq.push(['trackPageView', window.location.hash]);
    }
  });

  $("body").on("click", ".toggle-lc-button", function(evt){
    if(window._paq){
      window._paq.push(['trackPageView', evt.currentTarget.id]);
    }
  });

  // start the AGFK app
  var appRouter = new AppRouter();
  Backbone.history.start();
});
