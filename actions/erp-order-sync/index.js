/*
* <license header>
*/
const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
var request = require('request');

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
      var slackChannel = "poc";
      var slackMessage = "Order Data! \n" + JSON.stringify(params)

      var payload = {
          "channel": slackChannel,
          "username": "incoming-webhook",
          "text": slackMessage,
          "mrkdwn": true,
      };

      var options = {
          method: 'POST',
          url: "https://hooks.slack.com/services/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",
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(payload)
      };

      request(options, function (error, response, body) {
          if (error) {
              console.log("ERROR: fail to post " + response);
          } else {
              console.log ("SUCCESS: posted to slack " + response);
          }
      });

  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
