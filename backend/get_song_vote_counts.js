'use strict';
const services  = require('./service');
const config    = require('../lib/config');
const ing       = require('../lib/ing');
const drilldown = require('../lib/drilldown');

module.exports.handler = async (event) => {
  
  const service   = services();
  const result    = {
    statusCode: 200,
    headers   : {'Access-Control-Allow-Origin': '*'},
    body      : null
  };

  const params = {
    TableName       : config.dynamo.tableVoteCount,
  };

  const [err, data] = await ing( service.dynamo.scan(params).promise() );
  const records     = drilldown(data, 'Items'.split('.'));

  if( err || !records ){
    result.status = err.status || 404;
    result.body   = JSON.stringify(err || '[data.Items] was not found');
    return result;
  }

  let songVotes = [];
  for( let record of records ){
    songVotes.push({
        songName: record.songName,
        votes: record.votes
    });
  }

  result.body = JSON.stringify( songVotes );

  return result;
};
