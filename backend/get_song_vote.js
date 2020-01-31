'use strict';
const services  = require('./service');
const config    = require('../lib/config');
const ing       = require('../lib/ing');
const drilldown = require('../lib/drilldown');

module.exports.handler = async (event) => {
  
  const service   = services();
  const song_name = event.body.songName;
  const result    = {
    statusCode: 200,
    headers   : {'Access-Control-Allow-Origin': '*'},
    body      : null
  };

  const params = {
    TableName       : config.dynamo.tableVoteCount,
    Key             : {
      "songName": { S: song_name },
    }
  };

  const [err, data] = await ing( service.dynamo.getItem(params).promise() );
  const votes       = drilldown(data, 'Item.votes'.split('.'));

  if( err || !votes ){
    result.status = err.status || 404;
    result.body   = JSON.stringify(err || '[data.Item.votes] was not found');
    return result;
  }

  result.body = JSON.stringify( votes );

  return result;
};
