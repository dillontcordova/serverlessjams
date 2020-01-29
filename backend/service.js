const AWS               = require('aws-sdk');
const config            = require('../lib/config');
const logger            = require('../lib/logger')(config.log);
const serviceLogger     = require('../lib/awsServiceWrapper');
const dynamoShortcuts     = require('../lib/dynamoShortcuts');
// const s3Shortcuts     = require('../lib/s3Shortcuts');


function dynamoService( cfg ){
    const dynamoInstance        = new AWS.DynamoDB( cfg );
    dynamoInstance.prototype    = {...dynamoInstance.prototype, ...dynamoShortcuts};
    // dynamoInstance              = serviceLogger( dynamoInstance, logger );
    return dynamoInstance;
}

function s3Service( cfg ){
    const s3Instance        = new AWS.S3( cfg );
    // s3Instance.prototype    = {...s3Instance.prototype, ...s3Shortcuts};
    // s3Instance = serviceLogger( s3Instance, logger );
    return s3Instance;
}



module.exports = () => {
    return {
        // dynamo  : serviceLogger(new AWS.DynamoDB(config.aws), logger),
        // s3      : serviceLogger(new AWS.S3(config.aws), logger),
        dynamo  : dynamoService( config.aws ),
        s3      : new AWS.S3( config.aws )
        
    }
}