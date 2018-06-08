
const https = require('https');
const crypto = require('crypto');

const parameters = {
    hostname: 'api.elucidat.com',
    path: '/v2/releases/launch',
    consumer_key: '',
    consumer_secret: '',
    fields: {
        'release_code': '',
        'name': '',
        'email_address': ''
    }
};

/**
 * Makes an API request to elucidat
 * @param headers
 * @param fields
 * @param url
 * @param consumer_secret
 * @return mixed
 */
function callElucidat(options, callback) {
    
    const method = options.method || 'GET';
    // build the signature
    options.headers['oauth_signature'] = buildSignature(
        options.consumer_secret, 
        Object.assign(options.headers, options.fields || {}), 
        method, 
        (options.protocol || 'https://')+options.hostname+options.path
    );
    // and put the request together
    const requestOptions = {
        hostname: options.hostname,
        path: options.path + (method === 'GET' && options.fields ? '?'+buildBaseString(options.fields, '&') : '' ),
        method: method,
        headers: {
            'Authorization': buildBaseString(options.headers, ',')
        }
    };
    // now do the request
    https.request(requestOptions, (res) => {
        // console.log('statusCode:', res.statusCode);
        // console.log('headers:', res.headers);
        res.on('data', (d) => {
            callback(JSON.parse(d));
        });
    }).on('error', (e) => {
        console.error(e.message);
    }).end();
    
}

/**
 * Sorts object into order from keys - https://gist.github.com/stiekel/95526f20ec6915a594c6
 * @param object
 * @return object
 */
function ksort(obj) {
    var keys = Object.keys(obj).sort()
    , sortedObj = {};

    for(var i in keys) {
        sortedObj[keys[i]] = obj[keys[i]];
    }
    return sortedObj;
}

/**
 * Computes and returns a signature for the request.
 * @param $secret
 * @param $fields
 * @param $request_type
 * @param $url
 * @return string
 */
function buildSignature(consumer_secret, fields, requestType, url) {
    // fields must be in right order
    fields = ksort(fields);
    //Build base string to be used as a signature
    const baseInfo = requestType+'&'+url+'&'+buildBaseString(fields, '&'); //return complete base string
    //Create the signature from the secret and base string
    const compositeKey = encodeURIComponent(consumer_secret);
    // hash it
    return crypto.createHmac('sha1', consumer_secret).update(baseInfo).digest('base64')
}

/**
 * Builds a segment from an array of fields.  Its used to create string representations of headers and URIs
 * @param fields
 * @param delim
 * @return string
*/
function buildBaseString(obj, delim) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join(delim);
}

/**
 * Returns typical headers needed for a request
 * @param consumer_key
 * @param nonce
 */
function authHeaders(consumer_key, nonce = '') {
    const headers = {
        'oauth_consumer_key': consumer_key,
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': Math.round(Date.now() / 1000),
        'oauth_version':'1.0'
    };
    if (nonce.length)
        headers['oauth_nonce'] = nonce;
    return headers;
}

/**
 * Each request to the elucidat API must be accompanied by a unique key known as a nonce.
 * This key adds an additional level of security to the API.
 * A new key must be requested for each API call.
 * @param api_url
 * @param consumer_key
 * @param consumer_secret
 * @return bool
 */
function getNonce(options, callback) {
    const requestOptions = {
        headers: authHeaders(options.consumer_key),
        hostname: options.hostname,
        path: options.path,
        consumer_secret: options.consumer_secret
    };
    //Make a request to elucidat for a nonce...any url is fine providing it doesnt already have a nonce
    callElucidat(requestOptions, callback);
}

/* 
 *
 */
getNonce(parameters, function (nonceResponse) {
    if (nonceResponse.nonce) {
        // console.log(nonceResponse);
        parameters.headers = authHeaders(parameters.consumer_key, nonceResponse.nonce);
        callElucidat(parameters, function (data) {
            if (data.url) {
                // finally load the contents of the page
                https.get(data.url, function (res) {
                    var pageContent = '';
                    res.on('data', function (chunk) {
                        pageContent += chunk;
                    });
                    res.on('end', function () {
                        process.stdout.write(pageContent);
                    });
                }).on('error', function (e) {
                    console.error(e.message);
                }).end();
            }
        });
    } else {
        console.error('No nonce...');
    }
});
