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
    syncCommerceOrdersToERP();
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

/**
 * Synchronization Order to ERP
 */
function syncCommerceOrdersToERP() {
  var options = {
    'method': 'GET',
    'url': 'https://dd45-2401-4900-1cba-a19b-9103-af55-4e08-8c4d.ngrok-free.app/rest/all/V1/orders?'+
      'searchCriteria[filter_groups][0][filters][0][field]=status&'+
      '\nsearchCriteria[filter_groups][0][filters][0][condition_type]=eq'+
      '&searchCriteria[filter_groups][0][filters][0][value]=processing',
    'headers': {
      'Authorization': 'Bearer aeazv3wei3qm3g6fi3vvwq7rprwlhh39'
    }
  };
  request(options, function (error, response) {
    if (error)  {
      throw new Error(error);
    } else {
      var commerceResponse = JSON.parse(response.body);
      var commerceOrders = commerceResponse.items;
      /**
       * Iterate Each Commerce Order,Send Each Order to ERP
       */
      commerceOrders.forEach(commerceOrder => {
        //sendNotificationToSlack(commerceOrder);
      });
    }
  });
}

/**
 * Update to Slack Channel
 */
function sendNotificationToSlack(erpResponse) {

  var slackChannel = "poc";
  var slackMessage = "*ERP Order Synchronization Details!* \n" + '`' + JSON.stringify(erpResponse) + '`';

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
      console.log("ERROR: fail to post");
    } else {
      console.log ("SUCCESS: posted to slack");
    }
  });
}

exports.main = main
