<?php

/* Enter your credentials here */
$api_key = ''; // can be obtained from https://app.elucidat.com/api/project_v2
$api_secret = ''; // can be obtained from https://app.elucidat.com/api/project_v2
/* Enter your learner's details here */
$learner_name = '';
$learner_email = '';
/* And decide which release you'd like to show */
$release_code = ''; // can be obtained from API

/**
 * Makes an API request to elucidat
 * @param $headers
 * @param $fields
 * @param $url
 * @param $consumer_secret
 * @return mixed
 */
function call_elucidat($headers, $fields, $method, $url, $consumer_secret){
    //Build a signature
    $headers['oauth_signature'] = build_signature($consumer_secret, array_merge($headers, $fields), $method, $url);
    //Build OAuth headers
    $auth_headers = 'Authorization:';
    $auth_headers .= build_base_string($headers, ',');
    //Build the request string
    $fields_string = build_base_string($fields, '&');
    //Set the headers
    $header = array($auth_headers, 'Expect:');
    // Create curl options
    if(strcasecmp($method, "GET") == 0){
        $url .= '?'.$fields_string;
        $options = array(
            CURLOPT_HTTPHEADER => $header,
            CURLOPT_HEADER => false,
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false);
    } else {
        $options = array(
            CURLOPT_HTTPHEADER => $header,
            CURLOPT_HEADER => false,
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_POST => count($fields),
            CURLOPT_POSTFIELDS => $fields_string);
    }
    //Init the request and set its params
    $request = curl_init();
    curl_setopt_array($request, $options);
     //Make the request
    $response = curl_exec($request);
    $status = curl_getinfo($request, CURLINFO_HTTP_CODE);
    curl_close($request);
    return array(
        'status' => $status,
        'response' => json_decode($response, true)
    );
}

/**
 * Each request to the elucidat API must be accompanied by a unique key known as a nonce.
 * This key adds an additional level of security to the API.
 * A new key must be requested for each API call.
 * @param $api_url
 * @param $consumer_key
 * @param $consumer_secret
 * @return bool
 */
function get_nonce($api_url, $consumer_key, $consumer_secret){
    // Start with some standard headers, unsetting the oauth_nonce. without the nonce header the API will automatically issue us one.
    $auth_headers = auth_headers($consumer_key);
    unset($auth_headers['oauth_nonce']);

    //Make a request to elucidat for a nonce...any url is fine providing it doesnt already have a nonce
    $json = call_elucidat($auth_headers, array(), 'GET', $api_url, $consumer_secret);

    if(isset($json['response']['nonce'])){
        return $json['response']['nonce'];
    }
    return false;
}

/**
 * Computes and returns a signature for the request.
 * @param $secret
 * @param $fields
 * @param $request_type
 * @param $url
 * @return string
 */
function build_signature($secret, $fields, $request_type, $url){
    ksort($fields);
    //Build base string to be used as a signature
    $base_info = $request_type.'&'.$url.'&'.build_base_string($fields, '&'); //return complete base string
    //Create the signature from the secret and base string
    $composite_key = rawurlencode($secret);
    return base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));

}

/**
 * Builds a segment from an array of fields.  Its used to create string representations of headers and URIs
 * @param $fields
 * @param $delim
 * @return string
 */
function build_base_string($fields, $delim){
    $r = array();
    foreach($fields as $key=>$value){
        $r[] = rawurlencode($key) . "=" . rawurlencode($value);
    }
    return implode($delim, $r); //return complete base string

}

/**
 * Returns typical headers needed for a request
 * @param $consumer_key
 * @param $nonce
 */
function auth_headers($consumer_key, $nonce = ''){
    return array('oauth_consumer_key' => $consumer_key,
        'oauth_nonce' => $nonce,
        'oauth_signature_method' => 'HMAC-SHA1',
        'oauth_timestamp' => time(),
        'oauth_version' => '1.0');
}

$nonce = get_nonce('https://api.elucidat.com/v2/releases/launch', $api_key, $api_secret);
$headers = auth_headers( $api_key, $nonce);
$fields = array(
            'release_code'=>$release_code,
            'name'=>$learner_name,
            'email_address'=>$learner_email
        );
$result = call_elucidat($headers, $fields, 'GET', 'https://api.elucidat.com/v2/releases/launch', $api_secret);

?>
<!DOCTYPE html>
<!--[if IE 6]>         <html class="no-js ie6 ie-lt9"> <![endif]-->
<!--[if IE 7]>         <html class="no-js ie7 ie-lt9"> <![endif]-->
<!--[if IE 8]>         <html class="no-js ie8 ie-lt9"> <![endif]-->
<!--[if IE 9]>         <html class="no-js ie9"> <![endif]-->
<!--[if gt IE 9]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Elucidat website integration example</title>
        <!-- viewport behaviour IMPORTANT -->
        <!-- viewport behaviour IMPORTANT -->
        <!-- viewport behaviour IMPORTANT -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1">
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
        <style>
            body {
                padding: 0;
                margin: 0;
            }
            iframe {
                position: absolute;
                left: 0;
                top: 0;
            }
            div.debug {
                position: absolute;
                font-size: 10px;
                color: #fff;
                background-color: #c00;
                bottom: 0px;
                left: 0px;
                z-index: 1;
                padding:10px;
            }
        </style>
    </head>
    <body>
        <iframe frameborder="0" src="<?php echo $result['response']['url'] ?>" seamless></iframe>
        <div class="debug"><pre><?php echo ("HTTP status code: " . $result['status'] . "\n"); print_r($result['response']); ?></pre></div>
        <script>
            // Resizing to viewport code to enable responsiveness
            function resize () {
                $('iframe').height( $(window).height() ).width( $(window).width() );
            }
            resize();
            window.onresize = resize;
            window.addEventListener("orientationchange", function() {
                resize();
            }, false);
            // Listen out for window messages from Elucidat
            window.addEventListener("message", function (e) {
                $('div.debug pre').append("\n"+e.data);
            }, false);
        </script>
    </body>
</html>