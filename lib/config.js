module.exports = {
    sns: {
        topicarn            : process.env.SNS_TOPIC         || '',
        marsmethod          : process.env.MARS_METHOD       || '',
        executionNamePrefix : process.env.EXECUTION_PREFIX  || '',
    },
    snsEventTypes: {
        insert: ''
    },
    dynamo: {
        tableVoteCount : process.env.DYNAMODB_TABLE   || '',
    },
    status: {
        failed      : 'FAILED',
        killed      : 'KILLED',
        running     : 'RUNNING',
        foreign     : 'FOREIGN',
        killing     : 'KILLING',
        completed   : 'COMPLETED'
    },
    lambda: {
        cnBaseUrl   : process.env.CN_BASE_URL,
        apiVersion  : process.env.API_VERSION || 1,
        runtime     : {
            accessKeyId         : process.env.AWS_ACCESS_KEY_ID                 || '',
            secretAccessKey     : process.env.AWS_SECRET_ACCESS_KEY             || '',
            executionEnvironment: process.env.AWS_EXECUTION_ENV                 || '',
            sessionToken        : process.env.AWS_SESSION_TOKEN                 || '',
            securityToken       : process.env.AWS_SECURITY_TOKEN                || '',
            memorySize          : process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE   || '',
            functionVersion     : process.env.AWS_LAMBDA_FUNCTION_VERSION       || '',
            taskRook            : process.env.LAMBDA_TASK_ROOT                  || '',
            lang                : process.env.LANG                              || '',
            tz                  : process.env.TZ                                || ''
        }
    },
    aws: {
        region: process.env.AWS_REGION_WSD || 'us-west-2'
    },
    log: {
        name        : process.env.LOG_NAME      || 'serverless-feed',
        level       : process.env.LOG_LEVEL     || 'debug',
        language    : process.env.LANGUAGE      || 'en',
        islocalLog  : process.env.IS_LOCAL_LOG
    },
};
