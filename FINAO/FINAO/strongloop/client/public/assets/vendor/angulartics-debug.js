/**
 * @license Angulartics v0.16.3
 * (c) 2014 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
!function(a){"use strict";a.module("angulartics.debug",["angulartics"]).config(["$analyticsProvider",function(a){a.registerPageTrack(function(a){console.log("Page tracking: ",a)}),a.registerEventTrack(function(a,b){console.log("Event tracking: ",a,b)})}])}(angular);