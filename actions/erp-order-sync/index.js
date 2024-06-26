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

  logger.info(params);
  console.log(params);

  try {
    syncCommerceOrderToERP(params);
  } catch (error) {
    // log any server errors
    logger.error(error)
  }
}

/**
 * Synchronization Order to ERP
 */
function syncCommerceOrderToERP(params) {
  let order = params.data.value;
  console.log(order);
  sendNotificationToSlackGeneric('Order Data Received from Commerce. #' + order.increment_id, params);
  /**
   * Send Order to ERP
   */
  if (checkERPSyncStatus(order, params)) {
    sendNotificationToSlackGeneric('Sending order data to ERP. #' + order.increment_id , params);
    sendCommerceOrderToERP(order, params)
  }
}

function checkERPSyncStatus(commerceOrder, params){
  return true;
}

/**
 * Send Order Data to ERP
 * @param commerceOrder
 * @param params
 */
function sendCommerceOrderToERP(commerceOrder, params) {
  let commerceOrderData = JSON.stringify(commerceOrder);
  let options = {
    method: 'GET',
    url: params.ERP_API_ENDPOINT ,
    headers: { 'Content-type': 'application/json' },
    body: commerceOrderData
  };

  request(options, function (error, response) {
    if (error) {
      sendNotificationToSlackGeneric('Not able to send order to ERP', params);
      console.log("ERROR: Fail to post to ERP");
    } else {
      let erpResponse = response.body;
      let erpResponseJson = JSON.parse(erpResponse);

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
 *
 * @param erpResponseJson
 * @param params
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
        "state": "processing",
        "status": "processing",
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
    console.log(response.body);
  });

}

/**
 * Update to Slack Channel
 */
function sendNotificationToSlack(erpResponseJson, params) {

  let slackChannel = params.SLACK_CHANNEL_NAME;
  let erpSyncMessage= 'Order Sync with ERP is Successful';

  if (erpResponseJson.sync_status === '3') {
    erpSyncMessage = 'Order Sync with ERP is Failed';
  }

  let slackMessage = "*ERP Order Synchronization Details. Processed By AIO Data Publish !* \n" + erpSyncMessage + '\n' +
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
 * Send Notification to Slack Generic
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
