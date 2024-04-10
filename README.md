# Datm Web Analytics Tag for Google Tag Manager Web Container

You can use this tag for the Google Tag Manager web container to set up Datm's master web analytics pixel used for both web and server-side tracking.

The tag allows you to capture events and attributes (both standard and custom) from your website and send the information to a GTM server-side container or other HTTP endpoint, like Loggly, BetterStack, etc.

The tag offers similar tracking to Google Analytics and other web analytics tools, but is very lightweight and provides a more flexible data model and storage options.

## How to configure the Datm web analytics tag

- Enter the server domain for you reporting endpoint.  This can be a GTM server-side container domain or other location.  Do not include the protocol (`http://` or `https://`); the tag automatically sends all requests via HTTPS.
- Enter the path for the endpoint.  For GTM server containers, this is typically used by the client to claim the request.  By default this is set to `web-pixel/`.
- Enter an optional 'tag' value.  This can help identify the organization or web container that is sending the request.
- Select whether or not cookies should be used.  If selected, two cookies are set to track anonymous session and user identifiers: `datm_session` and `datm_client`.
- Enter any default tag configuration parameters that you would like to override; such as the Session ID, Client ID, or cookie domain.
- Select if you want all or unique event occurrences to be reported
- Enter values to be passed for event-level parameters.
	- Items in the 'Additional Parameters' section are added to the top-level of the payload JSON.
	- Items entered in the 'Custom Parameters' section are added to a nested object in the payload JSON called `custom`.
- Enter any default event attributes that you want to override, such as event ID, name, and timestamp ...and page URL, path, etc.
- Select if you want to view debug comments in the console (only applicable when in preview mode)

## Open Source

The Datm web analytics tag is developed and maintained by [Two Point One Analytics](www.2point1analytics.com) under the Apache 2.0 license.
