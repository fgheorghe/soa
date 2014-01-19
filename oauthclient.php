<?php

// Configure client application.
$clientId = "pDRgpAtqSbwRUHfYPAgJ6ehWHvca";
$clientSecret = "xPY0l5gNG6pYcIj54Nzv0o3t52Ua";

// Function used for checking if an OAuth code does not exist.
function codeDoesNotExist() {
	return !array_key_exists( "code", $_GET ) && !array_key_exists( "token", $_GET );
}

// If OAuth code does not exist, redirect user to Authorize URL.
if ( codeDoesNotExist() ) {
	// OAuth Authorize URL.
	$authUrl = "https://192.168.1.50:9543/oauth2/authorize" .
		"?response_type=code&client_id=" . $clientId . "&redirect_uri=http://localhost:81/&scope=records";
	// Redirection client to this location.
	header( "Location:" . $authUrl );
}

// Function used for checking if an OAuth code is passed id.
function codeExists() {
        return array_key_exists( "code", $_GET );
}
if ( codeExists() ) {
	// OAuth Access Token URL:
	$tokenUrl = "https://192.168.1.50:9543/oauth2/token";
	// Open curl request.
	$ch = curl_init();
	// Prepare request options
	curl_setopt( $ch, CURLOPT_URL, $tokenUrl ); // URL
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true ); // Capture response
	curl_setopt( $ch, CURLOPT_POST, 5 ); // Number of post fields
	curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
		'Content-Type: application/x-www-form-urlencoded'
	) );
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query( array( // POST Parameters
		"grant_type" => "authorization_code", "code" => $_GET["code"]
		,"redirect_uri" => "http://localhost:81/", "client_id" => $clientId
		,"client_secret" => $clientSecret
	) ) );
	// Ignore invalid SSL certificate.
	curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 0); curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, 0);
	// Execute POST request
	$result = curl_exec( $ch );
	// Get response code
	$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	// Decode JSON response
        $data = json_decode( $result );
	// Output debug data, including final URL.
	echo "HTTP Response Code: " . $http_code . "<br/>Raw HTTP Response: " . $result . "<br/>";
	echo "JSON Response: <pre>" . print_r( $data, true ) . "</pre><a href='?token=" . $data->access_token . "'>Continue</a>";
}

// Function used for checking if a token exists.
function tokenExists() {
        return array_key_exists( "token", $_GET );
}
if ( tokenExists() ) {
	echo "Patient data: ";
	// Create new connection
	$ch = curl_init();
	// Point to the configured service URL, including the patient id 1.
	$recordUrl = "https://192.168.1.99:8243/services/PatientRecords/1";
        curl_setopt( $ch, CURLOPT_URL, $recordUrl ); // URL
        curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
                'Authorization: Basic ' . $_GET["token"]
        ) );
	curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt( $ch, CURLOPT_POST, 0);
	curl_setopt( $ch, CURLOPT_HTTPGET, 1);
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true ); // Capture response
        $result = curl_exec( $ch );
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	echo "Token: " . $_GET["token"] . "<br/>Http code: " . $http_code . "<br/>Conent: <pre>" . print_r( $result, true ) . "</pre>";
}
