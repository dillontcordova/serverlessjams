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
    UpdateExpression: "ADD votes :inc",
    ReturnValues    : "UPDATED_NEW",
    Key             : {
      "songName": { S: song_name },
    },
    ExpressionAttributeValues: {
      ":inc": { N: "1" },
    }
  };

  const [err, data] = await ing( service.dynamo.updateItem(params).promise() );

  if( err || !drilldown(data, 'Attributes.votes'.split('.')) ){
    result.status = 404;
    result.body   = JSON.stringify(err || '[data.Attributes.votes] was not found');
    return result;
  }

  result.body = JSON.stringify({
    output: data.Attributes.votes
  });

  return result;
};
