
// https://www.npmjs.com/package/elucidat-api
const elucidatAPI = require('elucidat-api');

const credentials = {
    hostname: 'api.elucidat.com',
    consumer_key: '',
    consumer_secret: ''
};

// the project code I want to query - taken from the URL - e.g. https://app.elucidat.com/release/5dd580064b0b7
// this is from an account you won't have access to
const project_code = '5dd580064b0b7';
// Top tip - use a 'RequestBin' URL - so you can see what the webhook returns
// Top tip 2 - Make sure your URL is fully qualified and has a trailing /
const webhook_url = 'https://ca9fb1dbe14b924b7ce6c4fa4a54d24b.m.pipedream.net/';
const xapi_endpoint = 'https://ca9fb1dbe14b924b7ce6c4fa4a54d24b.m.pipedream.net/';

function seeIfSubscribedToWebhooks () {
    console.log('Checking if I am subscribed to webhook.');
    elucidatAPI(
        Object.assign({
            path: 'event',
        }, credentials),
        function (statusCode, response) {
            if (statusCode === 200) {
                if (response.hasOwnProperty('release_course') && response.release_course === webhook_url) {
                    console.log('Already subscribed to webhook.');
                    updateProjectXapiSettings();
                    //subscribeToWebhook();
                } else {
                    console.log('Not yet subscribed to webhook.');
                    subscribeToWebhook();
                }
            } else {
                console.error(response);
            }
        }
    );
}

function subscribeToWebhook () {
    console.log('Subscribing...');
    elucidatAPI(
        Object.assign({
            method: 'POST',
            path: 'event/subscribe',
            fields: {
                'event': 'release_course',
                'callback_url': webhook_url,
            }
        }, credentials),
        function (statusCode, response) {
            if (statusCode === 200) {
                console.log('Subscribed to webhook.');
                updateProjectXapiSettings();
            } else {
                console.error(statusCode, response);
            }
        }
    );
}

function updateProjectXapiSettings () {
    console.log('Updating release settings for Project...');
    elucidatAPI(
        Object.assign({
            method: 'POST',
            path: 'projects/configure',
            fields: {
                'project_code': project_code,
                'tracking_mode': 'scorm_1_2',
                'xapi_lrs_endpoint_url': xapi_endpoint,
                'xapi_lrs_endpoint_username': 'nobody',
                'xapi_lrs_endpoint_password': 'much',
            }
        }, credentials),
        function (statusCode, response) {
            if (statusCode === 200) {
                console.log('Updated project settings.');
                releaseProject();
            } else {
                console.error(statusCode, response);
            }
        }
    );

}

function releaseProject () {
    console.log('Creating a release for Project...');
    elucidatAPI(
        Object.assign({
            method: 'POST',
            path: 'releases/create',
            fields: {
                'project_code': project_code,
                'release_mode': 'scorm',
                'description': 'Released by API',
                // YOU CAN OPTIONALLY DO THESE HERE INSTEAD OF AT PREVIOUS STEP
                // 'xapi_lrs_endpoint_url': xapi_endpoint,
                // 'xapi_lrs_endpoint_username': 'nobody',
                // 'xapi_lrs_endpoint_password': 'much',
            }
        }, credentials),
        function (statusCode, response) {
            if (statusCode === 200) {
                console.log('Updated project settings.');
                releaseProject();
            } else {
                console.error(statusCode, response);
            }
        }
    );

}

seeIfSubscribedToWebhooks();