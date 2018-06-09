
const elucidatAPI = require('elucidat-api');
const https = require('https');

const parameters = {
    path: 'releases/launch',
    consumer_key: '',
    consumer_secret: '',
    fields: {
        'release_code': '',
        'name': '',
        'email_address': ''
    }
};

elucidatAPI(parameters, function (statusCode, response) {
    if (response.url) {
        // finally load the contents of the page
        https.get(response.url, function (res) {
            var pageContent = '';
            res.on('data', function (chunk) {
                pageContent += chunk;
            }).on('end', function () {
                process.stdout.write(pageContent);
            });
        }).on('error', function (e) {
            console.error(e.message);
        }).end();
    } else {
        console.error(response);
    }
});
