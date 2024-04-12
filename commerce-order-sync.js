let http = require('http');
const request = require("request");
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Order Sync to Adobe IO\n');

  /**
   * Call Commerce REST API to get Pending Orders
   * @type {(function(*, *, *): *)|{}}
   */
  let commerceOrder = '{"source":"urn:uuid:aa89ea71-b52b-4f44-866a-2a2d962fe701","data":{"_metadata":{"commerceEdition":"Adobe Commerce","commerceVersion":"2.4.6-p4","eventsClientVersion":"1.6.0","storeGroupId":"1","storeId":"1","websiteId":"1"},"key":"ddaa98ca-bd8b-4fb9-9f01-8035ec430e62","source":"NextGenCommerce.stage","value":{"created_at":"2024-04-05 13:16:02","customer_id":"5","discount_amount":0,"entity_id":"7","grand_total":53,"increment_id":"000000007","items":[{"discount_amount":0,"name":"Laser Cut Stretch Belt","price":48,"qty_ordered":1,"row_total":48,"row_total_incl_tax":48,"sku":"VA07-BC-S","tax_amount":0},{"discount_amount":0,"name":"Laser Cut Stretch Belt","price":0,"qty_ordered":1,"row_total":"0.0000","sku":"VA07-BC-S","tax_amount":"0.0000"}],"order_currency_code":"USD","payment":{"method":"checkmo"},"shipping_description":"Flat Rate - Fixed","state":"new","status":"pending","subtotal":48}},"id":"aa41052d-5c42-4437-84cc-79cc101efc7b","recipient_client_id":"259721d002e04ebc806c28da8696975f","time":"2024-04-05T13:16:04.553Z","type":"com.adobe.commerce.observer.sales_order_save_commit_after","LOG_LEVEL":"debug","datacontenttype":"application/json","event_id":"0e5f7a04-10d8-43b0-b7ac-8c0cea9e3d46","specversion":"1.0"}';
  console.log(commerceOrder)
  commerceOrder = JSON.parse(commerceOrder);
  let order = commerceOrder.data.value;
  let erpSyncOptions = {
    method: 'POST',
    url: "http://localhost:7777/process-order.php?dsdsd=1144",
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjEsInV0eXBpZCI6MiwiaWF0IjoxNzEyNTU4MjkzLCJleHAiOjE3MTI1NjE4OTN9.9HnQn6TPcKJpYtg0kL2PTph8IWYm_YphLSFzr4zKTD8'
    },
    body: order
  };


  let slackText = "";
  request(erpSyncOptions, function (error, response, body) {
    if (error) {
      console.log("ERROR: Fail to post to ERP. #" + order.increment_id);
      console.log(body);
      slackText = "Order failed to sync to ERP. Order ID: " + order.increment_id;
    } else {
      if (body.sync_status == 1) {
        slackText = "Order successfully synced to ERP. Order ID: " + order.increment_id;
        console.log ("SUCCESS: Posted to ERP. #" + order.increment_id);
      } else {
        slackText = "Order failed to sync to ERP. Order ID: " + order.increment_id;
        console.log("ERROR: Order Sync failed! #" + order.increment_id);
      }
      console.log(body);

      /**
       * Call Commerce Bulk API to update ERP Order Sync Status
       */
      let commerceOrderUpdateBody = [{
        "entity": {
          "entity_id": order.entity_id,
          "state": "processing",
          "status": "processing"
        }
      }];
      commerceOrderUpdateBody = JSON.stringify(commerceOrderUpdateBody);
      let commerceOption = {
        method: 'POST',
        url: "http://local.m2ee.com/rest/async/bulk/V1/orders",
        headers: { 'Content-type': 'application/json' },
        body: commerceOrderUpdateBody
      }

      request(commerceOption, function (error, response, body) {
        if (error) {
          console.log("ERP status update in commerce failed.!! " + body);
        } else {
          console.log("ERP status update in commerce success. " +  body);
        }
      });

      /**
       * Call Slack channel for order update
       */
      const slackPayload = {
        "channel": "test-channel-hackathon",
        "username": "incoming-webhook",
        "text": slackText,
        "mrkdwn": true
      }

      const slackRes = {
        method: 'POST',
        url: "https://hooks.slack.com/services/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",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(slackPayload)
      };
      request(slackRes, function (error, response, body) {
        if (error) {
          console.log("Could not send message to slack channel!! ");
          console.log(response.body);
        } else {
          console.log("Message Posted on the slack channel.");
          console.log(response.body);
        }
      });
    }
  });

  console.log("---------------------------------");

}).listen(1337, "localhost");
console.log('Server running at http://localhost:1337/');
