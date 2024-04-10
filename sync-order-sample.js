var http = require('http');
const request = require("request");

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');

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
      }
      /**
       * Iterate Each Commerce Order,Send Each Order to ERP
       */
      commerceOrders.forEach(commerceOrder => {
        sendCommerceOrderToERP(commerceOrder);
      });
    });
  }

  /**
   * Send Order Data to ERP
   * @param commerceOrder
   */
  function sendCommerceOrderToERP(commerceOrder) {
    var commerOrderData = JSON.stringify(commerceOrder);
    var options = {
      method: 'POST',
      url: "http://localhost:7777/process-order.php",
      headers: { 'Content-type': 'application/json' },
      body: commerOrderData
    };

    request(options, function (error, response) {
      var erpResponse = response.body;
      if (error) {
        console.log("ERROR: Fail to post to ERP");
        console.log(erpResponse);
      } else {
        console.log ("SUCCESS: Posted to ERP");
        console.log(erpResponse);

        updateCommerceOrderSyncStatus(erpResponse);
        sendNotificationToSlack(erpResponse);
      }
    });
  }

  /**
   * Update ERP Order Sync Status to Commerce
   */
  function updateCommerceOrderSyncStatus(erpResponse) {

  }

  /**
   * Update to Slack Channel
   */
  function sendNotificationToSlack(erpResponse) {

    var slackChannel = "poc";
    var slackMessage = "*ERP Order Synchronization Details!* \n" + '`' + erpResponse + '`';

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

  syncCommerceOrdersToERP();

}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');
