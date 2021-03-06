// Configuration - enable or disable SSL, testing. Some ESBs will not accept an invalid certificate.
var disableSSL = true;

// Prepare filesystem library.
var fs = require( 'fs' );

// Load SSL certificate.
if ( !disableSSL ) {
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
}

// Prepare ExpressJS and https libraries.
var express = require( 'express' )
        ,https = require( disableSSL ? 'http' : 'https' )
        // Create ExpressJS application.
        ,application = express()
        // Create HTTPS listener.
        ,httpsServer = disableSSL ? https.createServer( application ) : https.createServer( {
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
                ,"parameters": [ swagger.pathParam( "id", "Id of the record to return.", "integer" ) ]
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
                if ( !request.params.id ) {
                        throw swagger.errors.invalid( 'id' );
                }

                // Get id, and record data.
                var id = parseInt( request.params.id )
                        ,record = {}; // TODO: Get from memcache of if not found, from mongo.

                // As per: http://mongoosejs.com/docs/index.html
                var mongoose = require( 'mongoose' );
                mongoose.connect( 'mongodb://localhost/medical' );

                // Attach open event.
                mongoose.connection.once( 'open', function() {
                        console.log( id );
                        var recordSchema = new mongoose.Schema( {
                                        name: String
                                        ,id: Number
                                } )
                                ,recordModel = mongoose.model( 'records', recordSchema );

                        var record = recordModel.find( { id: id }, function( error, record ) {
                                // Prepare response.
                                if ( !error && record ) {
                                        response.send( JSON.stringify( { id: record[0].id, name: record[0].name } ) );
                                } else {
                                        throw swagger.errors.notFound( 'Record' );
                                }
                        } );
                } );
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
        httpsServer.listen( disableSSL ? 80 : 443, "localhost" );
} catch ( Exception ) {
        // Failed binding listener.
        console.log( "Can not bind listener: "
                                + Exception.message );

        // Abort execution.
        process.exit();
}
