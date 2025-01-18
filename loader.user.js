// ==UserScript==
// @name BC Marking
// @namespace https://www.bondageprojects.com/
// @version 1.6
// @description Bondage Club Markings for Luke's subs
// @author LillyBlueHair
// @downloadURL https://lillybluehair.github.io/Markings/loader.user.js
// @updateURL https://lillybluehair.github.io/Markings/loader.user.js
// @match https://*.bondageprojects.elementfx.com/R*/*
// @match https://*.bondage-europe.com/R*/*
// @match https://*.bondageprojects.com/R*/*
// @grant none
// @run-at document-end
// ==/UserScript==

(function () {
    "use strict";
    const src = `https://lillybluehair.github.io/Markings/marking.js?v=${Date.now()}`;
    if (typeof markings_loaded === "undefined") {
        console.log("loading Markings");
        const script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        script.crossOrigin = "anonymous";
        script.id = "Markings";
        document.head.appendChild(script);
    }
})();
