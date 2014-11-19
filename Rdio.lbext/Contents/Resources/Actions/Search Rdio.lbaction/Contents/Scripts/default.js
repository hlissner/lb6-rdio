include('oauth.js');
include('sha1.js');

function run() {
    LaunchBar.debugLog('run() called');
    openWithRdio('http://www.rdio.com/');
}

function runWithString(argument) {
    LaunchBar.debugLog('runWithString() called with argument ' + argument);

    if (Action.preferences.api === undefined) {
        // By default use hlissner's API key
        Action.preferences.api = {
            key: "qzgjrktzq7m84qcmwnva6uhj",
            secret: "FEzgu2bBSD"
        };
    }

    var RDIO_ENDPOINT = 'http://api.rdio.com/1/';
    var accessor = {
        consumerKey: Action.preferences.api.key,
        consumerSecret: Action.preferences.api.secret
    };

    var body = {
		'method' : 'searchSuggestions',
		'query' : argument,
		'types' : 'Track,Album,Artist',
		'extras' : '-*,name,url,type,artist,albumArtist,album,icon'
    };

    var OAuthMessage = {
		'action' : RDIO_ENDPOINT,
		'method' : 'POST',
		'parameters' : {}
    };

    for (var p in body) {
        OAuthMessage.parameters[p] = body[p];
    }

    OAuth.setTimestampAndNonce(OAuthMessage);
    OAuth.completeRequest(OAuthMessage, accessor);
    OAuth.SignatureMethod.sign(OAuthMessage, accessor);

    LaunchBar.debugLog(JSON.stringify(OAuthMessage));
    var OAuthParams = [];
    for (var p in OAuthMessage.parameters) {
        if (p.substring(0, 6) == "oauth_") {
            OAuthParams.push(p + '="' + OAuthMessage.parameters[p] + '"');
        }
    }
    var Authorization = 'OAuth ' + OAuthParams.sort().join(', ');
    LaunchBar.debugLog(Authorization);
    //body.parameters = null;

    var postdata = {
		'resultType' : 'json',
		'body' : body,
		'headerFields' : {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization' : Authorization
		}
	};
	LaunchBar.debugLog(JSON.stringify(postdata));

    var result = HTTP.post(RDIO_ENDPOINT, postdata);
	LaunchBar.debugLog(JSON.stringify(result));

    if (result == undefined) {
        LaunchBar.log('LaunchBar.execute() returned undefined');
        return [];
    }
    if (result.error != undefined) {
        LaunchBar.log('Error in execute: ' + result.error);
        return [];
    }
	if (!result.response.status || result.response.status != 200) {
        LaunchBar.log('HTTP Error: ' + JSON.stringify(result));
        return [];
    }
	if (!result.data.status || result.data.status != 'ok') {
        LaunchBar.log('API Error: ' + JSON.stringify(result));
        return [];
    }

    try {
        var suggestions = [];
        var subtitle = '';
        var icon;

        var url = 'http://www.rdio.com/search/' + encodeURIComponent(argument);
        suggestions.push({
						 'title' : argument,
						 'subtitle' : 'Search Rdio',
						 'icon' : 's',
						 'url' : url,
						 'action' : 'runAction',
						 'alwaysShowsSubtitle' : true
						 });

        for (var suggestion in result.data.result) {
			if (result.data.result[suggestion].artist) {
				subtitle = result.data.result[suggestion].artist;
			}
			if (result.data.result[suggestion].albumArtist && result.data.result[suggestion].artist && result.data.result[suggestion].albumArtist != result.data.result[suggestion].artist) {
				if (subtitle.length > 0) {
					subtitle += ' / ';
				}
				subtitle += result.data.result[suggestion].albumArtist;
			}
			if (result.data.result[suggestion].album) {
				if (subtitle.length > 0) {
					subtitle += ' - ';
				}
				subtitle += result.data.result[suggestion].album;
			}

			/* TOO SLOW and kind of ugly tbh
			icon = HTTP.getData(result.data.result[suggestion].icon);
			if (icon.response.status == 200 && icon.data && icon.data != undefined) {
				icon = 'data:image/png;base64,' + icon.data.toBase64String();
			} else {
				icon = result.data.result[suggestion].type
			}
			LaunchBar.debugLog(result.data.result[suggestion].icon + ' //// ' + icon.data.toBase64String());
			*/

			url = 'http://www.rdio.com' + result.data.result[suggestion].url;
			suggestions.push({
							 'title' : result.data.result[suggestion].name,
							 'subtitle' : subtitle,
							 'icon' : result.data.result[suggestion].type,
							 'url' : url,
							 'action' : 'runAction',
							 'alwaysShowsSubtitle' : true
							 });
		}
        LaunchBar.debugLog(JSON.stringify(suggestions));
        return suggestions;
    } catch (exception) {
        LaunchBar.log('Exception while parsing result: ' + exception);
        return [];
    }
}

function runWithURL(url, details) {
    LaunchBar.log('runWithURL() called with argument ' + url);
	openWithRdio(url);
}

function runAction(action) {
	var url = action.url;
	if (LaunchBar.options.alternateKey) {
		url = 'http://www.rdio.com/search/' + encodeURIComponent(action.title);
	}
	openWithRdio(url);
}

function openWithRdio(url) {
	LaunchBar.debugLog('openWithRdio() called with argument ' + url);
	// Use the Rdio desktop app if installed
	if (LaunchBar.executeAppleScript('id of application \"Rdio\"').length > 0) {
		LaunchBar.execute('/usr/bin/open', '-a', 'Rdio', url);
	} else {
		LaunchBar.openURL(url);
	}
}
