// Prepare filesystem library.
var fs = require( 'fs' );

// Load SSL certificate.
try {
        // Read UTF8 encoded data.
        var sslCertificate = fs.readFileSync( "cert/medical.crt", "utf8" )
                ,sslKey = fs.readFileSync( "cert/medical.key", "utf8" );
} catch ( Exception ) {
        // Failed loading certificate, notify user.
        console.log( "Can not load SSL certificate: "
                                + Exception.message );
        // Abort execution.
        process.exit();
}

// Prepare ExpressJS and https libraries.
var express = require( 'express' )
        ,https = require('https')
        // Create ExpressJS application.
        ,application = express()
        // Create HTTPS listener.
        ,httpsServer = https.createServer( {
                cert: sslCertificate
                ,key: sslKey
        }, application );

// Define allowed methods, and handlers.
/** Create. */
application.put( '/record/', function( request, response ) {
        // TODO: Implement.
} );

/** Read. */
application.get( '/record/:id', function( request, response ) {
        // TODO: Implement.
} );

/** Update. */
application.post( '/record/:id', function( request, response ) {
        // TODO: Implement.
} );

/** Delete. */
application.delete( '/record/:id', function( request, response ) {
        // TODO: Implement.
} );

// Bind listener, on default port 443.
try {
        httpsServer.listen( 443, "localhost" );
} catch ( Exception ) {
        // Failed binding listener.
        console.log( "Can not bind listener: "
                                + Exception.message );

        // Abort execution.
        process.exit();
}