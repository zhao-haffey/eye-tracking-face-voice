/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten/Cat release (2019-2021) author: Dr. Anthony Haffey (team@someopen.solutions)
*/

// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

/* old code for detecting safari
// Safari 3.0+ "[object HTMLElementConstructor]"
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
*/
var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent &&
               navigator.userAgent.indexOf('CriOS') == -1 &&
               navigator.userAgent.indexOf('FxiOS') == -1;


// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

// Chrome 1+
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);


// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

if(isIE){
  alert("This website does not work reliably on Internet Explorer - Please use another browser, preferably Google Chrome.");
}

if(isFirefox){
  //alert("The zooming works m")
}

if(isSafari){
  alert("This website does not work reliably on Safari - please use another browser, preferably Google Chrome.");
}

participant_browser = isOpera   ? "opera"
                    : isFirefox ? "firefox"
                    : isSafari  ? "safari"
                    : isIE      ? "internet_explorer"
                    : isEdge    ? "edge"
                    : isChrome  ? "chrome"
                    : isBlink   ? "blink" : "unknown";
