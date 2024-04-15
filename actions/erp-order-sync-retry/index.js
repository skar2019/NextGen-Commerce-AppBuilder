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
    syncCommerceOrdersToERP(params);
  } catch (error) {
    // log any server errors
    logger.error(error)
  }
}

/**
 * Synchronization Order to ERP
 */
function syncCommerceOrdersToERP(params) {
  let options = {
    'method': 'GET',
    'url': params.COMMERCE_API_ENDPOINT +'/rest/all/V1/orders?'+
      'searchCriteria[filter_groups][0][filters][0][field]=erp_sync_status&'+
      '\nsearchCriteria[filter_groups][0][filters][0][condition_type]=in'+
      '&searchCriteria[filter_groups][0][filters][0][value]=0,3',
    'headers': {
      'Authorization': 'Bearer ' + params.COMMERCE_BEARAR_TOKEN
    }
  };

  request(options, function (error, response) {
    if (error)  {
      sendNotificationToSlackGeneric('Not able to fetch order data from commerce', params);
      throw new Error(error);
    } else {
      let commerceResponse = JSON.parse(response.body);
      let commerceOrders = commerceResponse.items;
      sendNotificationToSlackGeneric('Order Data fetch from Commerce', params);
      /**
       * Iterate Each Commerce Order,Send Each Order to ERP
       */
      commerceOrders.forEach(commerceOrder => {
        if (checkERPSyncStatus(commerceOrder, params)) {
          sendNotificationToSlackGeneric('Iterate Order Data and send to ERP', params);
          sendCommerceOrderToERP(commerceOrder, params)
        }
      });
    }
  });
}

function checkERPSyncStatus(commerceOrder, params){
  return true;
}

/**
 * Send Order Data to ERP
 * @param commerceOrder
 */
function sendCommerceOrderToERP(commerceOrder, params) {
  let commerOrderData = JSON.stringify(commerceOrder);
  let options = {
    method: 'POST',
    url: params.ERP_API_ENDPOINT + '/process-order.php',
    headers: { 'Content-type': 'application/json' },
    body: commerOrderData
  };

  request(options, function (error, response) {
    var erpResponse = response.body;

    if (error) {
      sendNotificationToSlackGeneric('Not able to send order to ERP', params);
      console.log("ERROR: Fail to post to ERP");
      console.log(erpResponse);
    } else {
      var erpResponseJson = JSON.parse(erpResponse);

      sendNotificationToSlackGeneric('Order Data send to ERP', params);
      console.log ("SUCCESS: Posted to ERP");
      console.log(erpResponseJson);

      updateCommerceOrderSyncStatus(erpResponseJson,params);
      sendNotificationToSlack(erpResponseJson,params);
    }
  });
}

/**
 * Update ERP Order Sync Status to Commerce
 */
function updateCommerceOrderSyncStatus(erpResponseJson, params) {

  let request = require('request');
  let options = {
    'method': 'POST',
    'url': params.COMMERCE_API_ENDPOINT + '/rest/async/bulk/V1/orders',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + params.COMMERCE_BEARAR_TOKEN
    },
    body: JSON.stringify([{
      "entity": {
        "entity_id": erpResponseJson.commerce_order_id,
        "extension_attributes": {
          "erp_sync_status": erpResponseJson.sync_status,
          "erp_order_id" : erpResponseJson.erp_order_id
        }
      }
    }])

  };
  request(options, function (error, response) {
    if (error) {
      sendNotificationToSlackGeneric('Not able to update ERP sync Status data to Commerce', params);
      throw new Error(error);
    } else {
      sendNotificationToSlackGeneric('Able to update ERP sync Status to Commerce', params);
    }
  });

}

/**
 * Update to Slack Channel
 */
function sendNotificationToSlack(erpResponseJson, params) {

  let slackChannel = params.SLACK_CHANNEL_NAME;
  let erpSyncMessage= 'Order Sync with ERP is Successful';

  if (erpResponseJson.sync_status == '0') {
    erpSyncMessage = 'Order Sync with ERP is Failed';
  }

  let slackMessage = "*ERP Order Synchronization Details !* \n" + erpSyncMessage + '\n' +
    '`' + JSON.stringify(erpResponseJson) + '`';

  let payload = {
    "channel": slackChannel,
    "username": "incoming-webhook",
    "text": slackMessage,
    "mrkdwn": true,
  };

  let options = {
    method: 'POST',
    url: params.SLACK_POST_URL,
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

/**
 *
 * @param message
 * @param params
 */
function sendNotificationToSlackGeneric(message, params) {

  if (params.ENLABLE_DEBUG == 1) {
    let slackChannel = params.SLACK_DEBUG_CHANNEL_NAME;
    let slackMessage = '*' + message + '*';

    let payload = {
      "channel": slackChannel,
      "username": "incoming-webhook",
      "text": slackMessage,
      "mrkdwn": true,
    };

    let options = {
      method: 'POST',
      url: params.SLACK_DEBUG_POST_URL,
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
}

exports.main = main
