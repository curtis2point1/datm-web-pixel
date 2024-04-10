/*
  v2:   Removed session ID (no cookies required)
        Trimmed other non-critical features

        Removed console logs
        Removed try/catch block for XHR request
        Added sendBecon option (default)
        Added defailt event_id and event_time parameters

        Moved intialization function to prototype method
        Added condition to only run initialization once
        Added constants as object properties
        Added event ID logic as object method

        Added cookie use and custom domain options
        Added session and client ID logic

*/

(function (window) {
  
  if (window.datmWeb && window.datmWeb.loaded) {
    return;
  }
  
  var MAX_BEACON_SIZE = 14336;

  function DatmTracker() {
    this.loaded = true;
    this.initialized = false;
    this.maxBeaconSize = MAX_BEACON_SIZE;
    this.useCookies = true;
    this.baseUrl = null;
    this.sessionId = null;
    this.clientId = null;
    this.cookieDomain = null;
  }

  DatmTracker.prototype = {
    push: function (data) {
      if (typeof data !== "object") {
        return
      }

      if (data.serverDomain && data.serverPath) {
        this.initialize(data);
        return;
      }

      if (this.initialized) {
        this.track(data);
      }
    },

    initialize: function (config) {
      var domain = config.serverDomain
        .replace(/https:\/\/|^\/|$\//g, '')
        .trim()
        .toLowerCase();

      var path = config.serverPath
        .replace(/^\/|\/$/g, '')
        .trim()
        .toLowerCase();
      
      this.baseUrl = 'https://'+ domain + '/' + path;
      
      if (config.useCookies === false) {
        this.useCookies = false;
      }

      if (this.useCookies === true) {
        this.setCookieDomain(config.cookieDomain);
        this.setSessionId();
        this.setClientId();
      }
      
      this.initialized = true;
    },

    track: function (payload) {
      var event = payload.event || payload.event_name;
      var postUrl = event ? this.baseUrl + '?event=' + event : this.baseUrl;
      
      payload.event_id = payload.event_id || this.createEventId();
      payload.event_time = payload.event_time || new Date().toISOString();
      payload.session_id = payload.session_id || this.sessionId || null;
      payload.client_id = payload.client_id || this.clientId || null;
      
      var payloadString = JSON.stringify(payload);

      if (navigator.sendBeacon && payloadString.length < this.maxBeaconSize) {
        navigator.sendBeacon(postUrl, payloadString);
      }

      else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", postUrl, true); //true for asynchronous request
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.send(payloadString);
      }
    },

    setCookieDomain: function(customDomain) {
      if (customDomain) {
        this.cookieDomain = customDomain;
      }
      else {
        this.cookieDomain = '.' + document.location.hostname
          .split('.')
          .slice(-2)
          .join('.');
      }
    },

    setSessionId: function() {
      var cookies = document.cookie;

      if (cookies.indexOf('datm_session=') > -1) {
        this.sessionId = cookies.match(/datm_session=([^;]*)/)[1];
      }
      else {
        this.sessionId = this.createEventId();
        
        document.cookie = 'datm_session=' +
          this.sessionId +
          '; domain=' +
          this.cookieDomain +
          '; path=/';
      }
    },

    setClientId: function() {
      var cookies = document.cookie;
      
      if (cookies.indexOf('datm_client=') > -1) {
        this.clientId = cookies.match(/datm_client=([^;]*)/)[1];
      }
      else {
        var date = new Date();
        date.setFullYear(date.getFullYear() + 1);

        this.clientId = this.sessionId;

        document.cookie = 'datm_client=' +
          this.clientId +
          '; expires=' +
          date.toUTCString() +
          '; domain=' +
          this.cookieDomain +
          '; path=/';
      }
    },

    createEventId: function() {
      return Date.now()
        + '-'
        + ('000000' + Math.floor(Math.random() * 0xffffff).toString(16))
          .slice(-6)
          .toUpperCase();
    }
  };

  // Process queue
  var queue = window.datmWeb;

  var tracker = new DatmTracker();

  if (queue && queue.length) {
    for (var i = 0; i < queue.length; i++) {
      tracker.push(queue[i]);
    }
  }

  // Global tracker
  window.datmWeb = tracker;

})(window);