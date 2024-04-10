/*
TODO: - add cookie consent integration
        - operate in cookie-less mode when consent declined
        - remove any potential PII from hits (user provided data, user ID, etc.)
        - reprocess queue if consent is granted
        - create logic for de-duping reprocessed requests
*/

const copyFromDataLayer = require('copyFromDataLayer');
const getUrl = require('getUrl');
const getReferrerUrl = require('getReferrerUrl');
const readTitle = require('readTitle');
const injectScript = require('injectScript');
const callInWindow = require('callInWindow');
const logToConsole = require('logToConsole');
const setInWindow = require('setInWindow');
const templateStorage = require('templateStorage');
const makeTableMap = require('makeTableMap');

// Tag config
const serverDomain = data.serverDomain;
const serverPath = data.serverPath;
const tag = data.tag;
const useCookies = data.useCookies;
const sessionId = data.sessionId;
const clientId = data.clientId;
const cookieDomain = data.cookieDomain;

// Event config
const eventCountMethod = data.eventCountMethod;
const eventDetail = data.eventDetail;
const userObject = data.userObject || {};
const userId = data.userId;
const userType = data.userType;
const pageName = data.pageName;
const pageGroup = data.pageGroup;
const ecommerceData = data.ecommerceData || {};
const additionalParams = data.additionalParams || [];
const customParams = makeTableMap(data.customParams || [], 'key', 'value');
const eventId = data.eventId;
const event = data.eventName || copyFromDataLayer('event');
const eventTime = data.eventTime;

// Default parameters
const pageUrl = data.pageUrl || getUrl() ;
const pageHost = data.pageHost || getUrl('host');
const pagePath = data.pagePath || getUrl('path');
const pageTitle = data.pageTitle || readTitle();
const referrerUrl = data.referrerUrl || getReferrerUrl();
const referrerHost = data.referrerHost || getReferrerUrl('host');
const referrerPath = data.referrerPath || getReferrerUrl('path');

// Debug config
const isLoggingEnabled = data.isLoggingEnabled;

// Exclude GTM auto events
if (getUrl('host') === 'gtm-msr.appspot.com') {
  return data.gtmOnSuccess();
}

const scriptSource = 'https://' + serverDomain + '/web-pixel.min.js';

// Initialize pixel object
if (setInWindow('datmWeb', []) === true) {
  log('datmWeb object not yet defined');
  
  const config = {
    serverDomain: serverDomain,
    serverPath: serverPath,
    useCookies: useCookies,
    cookieDomain: cookieDomain
  };

  callInWindow('datmWeb.push', config);
  injectScript(scriptSource);

  log('initialized pixel object', config);
}

// Unique event tracking
log('checking uniqueness setting:', event);

if (eventCountMethod === 'unique') {

  if (templateStorage.getItem(event)) {
    log('event already executed on page:', event);
    return data.gtmOnSuccess();
  }
  else {
    templateStorage.setItem(event, true);
  }

}

log('no uniqueness constraint applied');

// Build event payload
log('building event data');

let payload = {
  event: event,
  event_id: eventId,
  event_time: eventTime,
  tag: tag,
  event_detail: eventDetail,
  session_id: sessionId,
  client_id: clientId,
  user: {
    id: userId,
    type: userType,
    email: userObject.email,
    phone: userObject.phone_number,
  },
  page: {
    url: pageUrl,
    host: pageHost,
    path: pagePath,
    title: pageTitle,
    name: pageName,
    group: pageGroup
  },
  referrer: {
    url: referrerUrl,
    host: referrerHost,
    path: referrerPath
  },
  ecommerce: ecommerceData,
  custom: customParams
};

// Additional top-level parameters
for (let i = 0; i < additionalParams.length; i++) {
  let key = additionalParams[i].key;
  let value = additionalParams[i].value;

  payload[key] = value;
}

// Send event payload
callInWindow('datmWeb.push', payload);
log('server event sent', payload);

return data.gtmOnSuccess();


/* FUNCTIONS */

function log(value1, value2) {
  if (!isLoggingEnabled) {
    return;
  }
    
  if (typeof value2 !== 'undefined') {
    logToConsole('GTM:', value1, value2);
  }
  else {
    logToConsole('GTM:', value1);
  }
}
