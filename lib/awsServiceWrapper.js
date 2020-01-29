const elasticLogger = require('./logger');
const defaultLogConfig = {
    elasticSearchHost   : '',
    language            : 'en',
    level               : 'debug',
    name                : 'serverless-feed'
};

module.exports = {
    log: function( service, inputLogger=elasticLogger(defaultLogConfig), {errTransform=defaultErrorXform, dataTransform=defaultDataTransform, obtainStatus=defaultObtainStatus}={} ){
        let serviceFacade = {};
        Object.keys(Object.getPrototypeOf(service)).forEach((key) => {
            serviceFacade[key] = methodWithLogging( service, key, inputLogger, {
                                                        errTransform    : errTransform,
                                                        obtainStatus    : obtainStatus,
                                                        dataTransform   : dataTransform
                                                    });
        });
        return serviceFacade;
    },

    response: {
        api: function ( err, data, params, {errTransform=defaultErrorXform, dataTransform=defaultDataTransform, obtainStatus=defaultObtainStatus}={}, headers={'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'} ){

            data            = dataTransform ( data, params );
            err             = errTransform  ( err, data, params );
            const body      = err || data;
            const statusCode= obtainStatus  ( err, data );

            return {
                headers     : headers,
                statusCode  : statusCode,
                body        : typeof body !== 'string' ? JSON.stringify(body): body
            };
        },

        step: function ( err, data, event, params='' ){

            if( err  || !data ){
                err = defaultErrorXform( err, data, params );
            } else {
                data = defaultDataTransform( data, event );
            }
            return err || data;
        }
    }
};

function getIdFromParams( params ){
    let recId   = null;
    if( params ){
        const dynamoId  = params && (params.Key && params.Key.id || (params.Item && params.Item.id) );
        const s3Id      = null;//params.s3Key || params.s3Id;
        recId           = dynamoId || s3Id;
    }
    return recId;
}

function defaultDataTransform( data, params ){
    let record  = null;

    if( data ){
        const dynamoRec = data.Item || data.Attributes || (params && params.Item);
        const s3Rec     = null;//data.s3Item || data.s3Attributes;
        record          = dynamoRec || s3Rec || (!!Object.keys(data).length && data) || record;
    }

    return record;
}

function defaultObtainStatus( err, data ){
    let status = 200;

    if( err ){
        if( err.statusCode ){
            status = err.statusCode;
        } else {
            status = !data ? 404 : 400;
        }

        //TODO: Add onto this, for each s3 and dynamo code to identify what statusCode we wish to return
        if( err.code ){
            switch( err.code ){
                case 'ConditionalCheckFailedException':
                    status = 404;
                    break;
                case 'ResourceNotFoundException':
                    status = 500;
                    break;
            }
        }
    }
    return status;
};

function defaultErrorXform( err, data, params ){

    let newErr = null;

    if( err  || !data ){
        if( err ){
            newErr = err;
            if( typeof err !== 'object' ){
                newErr = {
                    message: err
                };
            }
        } else {
            newErr = {
                message: `No data found for id: "${getIdFromParams(params)}"`
            };
        }

        newErr = Object.assign( {}, newErr, {
            params: params
        });
        //TODO: regEx analysis here
    }

    return newErr;
}

function serviceLog( service, key, params, logger, error, data, name ){

    const logLvl = error ? 'error' : 'info';

    const logData = {
        key     : key,
        data    : data,
        error   : error,
        params  : params,
        name    : name || 'raw',
        service : service.serviceIdentifier
    };

    logger[logLvl]( JSON.stringify( logData ) );
}

function log( service, key, params, logger, err, resp, {errTransform, dataTransform, obtainStatus}){
    try {
        serviceLog( service, key, params, logger, err, resp, 'raw' );

        const data  = dataTransform( resp, params );
        const error = errTransform( err, data, params );
        serviceLog  ( service, key, params, logger, error, data, 'xform' );
    } catch(e) {
        console.error(e.getMessage());
    }
}


function methodWithLogging( service, key, logger, {errTransform, dataTransform, obtainStatus} ){
    return function( /*arguments*/ ){
        const args      = Array.prototype.slice.call(arguments);
        const cb        = args[args.length - 1];
        const params    = args[0];

        if ( cb && typeof cb === 'function' ) {
            service[key]( params, (err, resp) => {
                log( service, key, params, logger, err, resp, {errTransform, dataTransform, obtainStatus});
                cb( err, resp );
            });
        } else {
            let return_value = service[key](params);

            if (return_value && typeof return_value.promise === 'function') {
                return return_value.promise()
                    .then(resp => {
                        log( service, key, params, logger, null, resp, {errTransform, dataTransform, obtainStatus});
                        return resp;
                    }).catch(err => {
                        log( service, key, params, logger, err, null, {errTransform, dataTransform, obtainStatus});
                        throw(err);
                    });
            } else {
                return return_value;
            }
        }
    }
}