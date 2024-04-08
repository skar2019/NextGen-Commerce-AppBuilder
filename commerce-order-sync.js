let http = require('http');
const request = require("request");
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Order Sync to Adobe IO\n');

  /**
   * Call Commerce REST API to get Pending Orders
   * @type {(function(*, *, *): *)|{}}
   */
  let commerceOrder = '{"base_currency_code":"INR","base_discount_amount":0,"base_grand_total":1005,"base_discount_tax_compensation_amount":0,"base_shipping_amount":5,"base_shipping_discount_amount":0,"base_shipping_discount_tax_compensation_amnt":0,"base_shipping_incl_tax":5,"base_shipping_tax_amount":0,"base_subtotal":1000,"base_subtotal_incl_tax":1000,"base_tax_amount":0,"base_total_due":1005,"base_to_global_rate":1,"base_to_order_rate":1,"billing_address_id":2,"created_at":"2024-04-05 04:31:51","customer_email":"shaandg@gmail.com","customer_firstname":"Shantanu","customer_group_id":0,"customer_is_guest":1,"customer_lastname":"Dasgupta","customer_note_notify":1,"discount_amount":0,"entity_id":1,"global_currency_code":"INR","grand_total":1005,"discount_tax_compensation_amount":0,"increment_id":"000000001","is_virtual":0,"order_currency_code":"INR","protect_code":"bd6f8d447ab2abc76308ee08a616bb9c","quote_id":1,"remote_ip":"::1","shipping_amount":5,"shipping_description":"Flat Rate - Fixed","shipping_discount_amount":0,"shipping_discount_tax_compensation_amount":0,"shipping_incl_tax":5,"shipping_tax_amount":0,"state":"processing","status":"processing","store_currency_code":"INR","store_id":1,"store_name":"Main Website\\r\\nMain Website Store\\r\\nDefault Store View","store_to_base_rate":0,"store_to_order_rate":0,"subtotal":1000,"subtotal_incl_tax":1000,"tax_amount":0,"total_due":1005,"total_item_count":1,"total_qty_ordered":1,"updated_at":"2024-04-05 05:12:18","weight":10,"items":[{"amount_refunded":0,"base_amount_refunded":0,"base_discount_amount":0,"base_discount_invoiced":0,"base_discount_tax_compensation_amount":0,"base_original_price":1000,"base_price":1000,"base_price_incl_tax":1000,"base_row_invoiced":0,"base_row_total":1000,"base_row_total_incl_tax":1000,"base_tax_amount":0,"base_tax_invoiced":0,"created_at":"2024-04-05 04:31:51","discount_amount":0,"discount_invoiced":0,"discount_percent":0,"free_shipping":0,"discount_tax_compensation_amount":0,"is_qty_decimal":0,"is_virtual":0,"item_id":1,"name":"test product","no_discount":0,"order_id":1,"original_price":1000,"price":1000,"price_incl_tax":1000,"product_id":1,"product_type":"simple","qty_canceled":0,"qty_invoiced":0,"qty_ordered":1,"qty_refunded":0,"qty_returned":0,"qty_shipped":0,"quote_item_id":1,"row_invoiced":0,"row_total":1000,"row_total_incl_tax":1000,"row_weight":10,"sku":"test-product","store_id":1,"tax_amount":0,"tax_invoiced":0,"tax_percent":0,"updated_at":"2024-04-05 04:31:51","weight":10}],"billing_address":{"address_type":"billing","city":"Chhindwara","country_id":"IN","email":"shaandg@gmail.com","entity_id":2,"firstname":"Shantanu","lastname":"Dasgupta","parent_id":1,"postcode":"480001","region":"Madhya Pradesh","region_code":"MP","region_id":588,"street":["test","test"],"telephone":"8349110607"},"payment":{"account_status":null,"additional_information":["Check \\/ Money order"],"amount_ordered":1005,"base_amount_ordered":1005,"base_shipping_amount":5,"cc_exp_year":"0","cc_last4":null,"cc_ss_start_month":"0","cc_ss_start_year":"0","entity_id":1,"method":"checkmo","parent_id":1,"shipping_amount":5},"status_histories":[],"extension_attributes":{"shipping_assignments":[{"shipping":{"address":{"address_type":"shipping","city":"Chhindwara","country_id":"IN","email":"shaandg@gmail.com","entity_id":1,"firstname":"Shantanu","lastname":"Dasgupta","parent_id":1,"postcode":"480001","region":"Madhya Pradesh","region_code":"MP","region_id":588,"street":["test","test"],"telephone":"8349110607"},"method":"flatrate_flatrate","total":{"base_shipping_amount":5,"base_shipping_discount_amount":0,"base_shipping_discount_tax_compensation_amnt":0,"base_shipping_incl_tax":5,"base_shipping_tax_amount":0,"shipping_amount":5,"shipping_discount_amount":0,"shipping_discount_tax_compensation_amount":0,"shipping_incl_tax":5,"shipping_tax_amount":0}},"items":[{"amount_refunded":0,"base_amount_refunded":0,"base_discount_amount":0,"base_discount_invoiced":0,"base_discount_tax_compensation_amount":0,"base_original_price":1000,"base_price":1000,"base_price_incl_tax":1000,"base_row_invoiced":0,"base_row_total":1000,"base_row_total_incl_tax":1000,"base_tax_amount":0,"base_tax_invoiced":0,"created_at":"2024-04-05 04:31:51","discount_amount":0,"discount_invoiced":0,"discount_percent":0,"free_shipping":0,"discount_tax_compensation_amount":0,"is_qty_decimal":0,"is_virtual":0,"item_id":1,"name":"test product","no_discount":0,"order_id":1,"original_price":1000,"price":1000,"price_incl_tax":1000,"product_id":1,"product_type":"simple","qty_canceled":0,"qty_invoiced":0,"qty_ordered":1,"qty_refunded":0,"qty_returned":0,"qty_shipped":0,"quote_item_id":1,"row_invoiced":0,"row_total":1000,"row_total_incl_tax":1000,"row_weight":10,"sku":"test-product","store_id":1,"tax_amount":0,"tax_invoiced":0,"tax_percent":0,"updated_at":"2024-04-05 04:31:51","weight":10}]}],"payment_additional_info":[{"key":"method_title","value":"Check \\/ Money order"}],"applied_taxes":[],"item_applied_taxes":[],"gift_cards":[],"base_gift_cards_amount":0,"gift_cards_amount":0,"gw_base_price":"0.0000","gw_price":"0.0000","gw_items_base_price":"0.0000","gw_items_price":"0.0000","gw_card_base_price":"0.0000","gw_card_price":"0.0000"}}';
  console.log(commerceOrder)
  let erpSyncOptions = {
    method: 'POST',
    url: "http://localhost:7777/process-order.php?dsdsd=1144",
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjEsInV0eXBpZCI6MiwiaWF0IjoxNzEyNTU4MjkzLCJleHAiOjE3MTI1NjE4OTN9.9HnQn6TPcKJpYtg0kL2PTph8IWYm_YphLSFzr4zKTD8'
    },
    body: commerceOrder
  };
  commerceOrder = JSON.parse(commerceOrder);

  let slackText = "";
  request(erpSyncOptions, function (error, response, body) {
    if (error) {
      console.log("ERROR: Fail to post to ERP");
      console.log(response.body);
      slackText = "Order failed to sync to ERP. Order ID: " + commerceOrder.increment_id;
    } else {
      slackText = "Order successfully synced to ERP. Order ID: " + commerceOrder.increment_id;
      console.log ("SUCCESS: Posted to ERP");
      console.log(response.body);

      /**
       * Call Commerce Bulk API to update ERP Order Sync Status
       */
      let commerceOrderUpdateBody = [{
        "entity": {
          "entity_id": commerceOrder.entity_id,
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
          console.log("ERP status update in commerce failed.!! " + response.body);
        } else {
          console.log("ERP status update in commerce success. " +  response.body);
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
