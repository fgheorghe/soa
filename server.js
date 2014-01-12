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
        }, application )
        // Prepare swagger, as per:
        // https://github.com/wordnik/swagger-node-express/blob/master/README.md
        ,url = require("url")
        ,swagger = require("swagger-node-express");

// Prepare application requirements.
application.use( express.json() );
application.use( express.urlencoded() );

// Register application, as part of swagger.
swagger.setAppHandler( application );

// Record read description.
var getRecordById = {
        'spec': {
                "description": "Single record read operation."
                ,"path": "/record/{id}"
                ,"notes": "Returns a record by id."
                ,"summary": "Find record by id."
                ,"method": "GET"
                ,"parameters": [ swagger.pathParam( "id", "Id of the record to return.", "integer") ]
                ,"type": "Record"
                ,"errorResponses": [
                        swagger.errors.invalid( 'id' )
                        ,swagger.errors.notFound( 'Record' )
                ]
                ,"responseClass": "Record"
                ,"nickname": "getRecordById"
        },
        'action': function ( request, response ) {
                // Validate input parameters.
                if ( !request.params.petId ) {
                        throw swagger.errors.invalid( 'id' );
                }

                // Get id, and record data.
                var id = parseInt( req.params.petId )
                        ,record = {}; // TODO: Get from memcache of if not found, from mongo.

                // Prepare response.
                if ( record ) {
                        response.send( JSON.stringify( record ) );
                } else {
                        throw swagger.errors.notFound( 'Record' );
                }
        }
};

// Create record model.
Models = {
        "Record": {
                "id": "Record"
                ,"description": "A patient's record."
                ,"required": [
                        "id"
                ]
                ,"properties": {
                        "name": {
                                "type": "string"
                        }
                        ,"id": {
                                "type": "integer"
                                ,"format": "int64"
                        }
                }
        }
};

// Register model.
swagger.addModels( Models );
// Register handler.
swagger.addGet( getRecordById );

// Configure path, API url and version.
swagger.configureSwaggerPaths( "", "/api", "" );
swagger.configure( "http://localhost", "0.1" );

// Define allowed methods, and handlers.
/** Create. */
application.put( '/record/', getRecordById.action );

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