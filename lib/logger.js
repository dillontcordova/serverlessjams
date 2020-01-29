
/**
 * @param {Object} config
 */
module.exports = function logger( config ){

    const oldCon = {
        log     : console.log,
        dir     : console.dir,
        info    : console.info,
        warn    : console.warn,
        debug   : console.debug,
        error   : console.error
    };

    // when `config.levels` is not available
    const severity = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    const doit = (thisLevel) => (message) => {
        // filter before writing to STDOUT
        if (config.levels) {
            if (!config.levels.includes(thisLevel)) {
                return;
            }
        } else {
            if (severity[thisLevel] < severity[config.level || 'info']) {
                return;
            }
        }

        let parsedMessage;
        try {
            parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;
            parsedMessage.message = parsedMessage.message || JSON.stringify(message);
        } catch (e) {
            parsedMessage = {
                message: message
            };
        }

        const msgWithIndices = Object.assign({}, parsedMessage, {
            time: Date.now(),
            level: thisLevel,
            language: parsedMessage.language || config.language || 'undefined',
        });
        (oldCon[thisLevel] || oldCon.log)(JSON.stringify(msgWithIndices));
    }

    const log = {
        dir: doit('debug'),
        debug: doit('debug'),
        log: doit('info'),
        info: doit('info'),
        warn: doit('warn'),
        error: doit('error')
    };

    /** NOTE: pseudo: language translation **/
    // ['fatal', 'error', 'warn', 'trace', 'info', 'debug'].forEach( (key) => {
    //     log[key] = function () {
    //         const msg = arguments[1];
    //         const googleTranslate = require('google-translate');
    //         googleTranslate.translate(msg, config.log.LANGUAGE, function(err, translation) {
    //             arguments[1] = translation.translatedText;
    //             log[key](arguments);
    //         });
    //     };
    // });

    if( !config.islocalLog || !JSON.parse(config.islocalLog) ){
        Object.keys(log).forEach( (key) => {
            if( console[key] ){
                console[key] = log[key];
            }
        })
    }
    return log;
};
