var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');

  /**
   * Call Commerce REST API to get Pending Orders
   * @type {(function(*, *, *): *)|{}}
   */
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': 'http://local.commerce.com:8085/rest/all/V1/orders?'+
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
      //console.log(response.body);
      var commerceResponse = JSON.parse(response.body);
      //console.log(orders.items);
      var commerceOrders = commerceResponse.items;
    }
    /**
     * Iterate Each Commerce Order
     */
    commerceOrders.forEach(commerceOrder => {

      /**
       * Send Each Order to ERP
       * @type {string}
       */
      var commerOrderData = JSON.stringify(commerceOrder);
      var options = {
        method: 'POST',
        url: "http://localhost:7777/process-order.php?dsdsd=1144",
        headers: { 'Content-type': 'application/json' },
        body: commerOrderData
      };

      request(options, function (error, response, body) {
        if (error) {
          console.log("ERROR: Fail to post to ERP");
          console.log(response.body);
        } else {
          console.log ("SUCCESS: Posted to ERP");
          console.log(response.body);

          /**
           * Call Commerce Bulk API to update ERP Order Sync Status
           */

          /**
           * Call Slack channel for order update
           */

        }
      });

      console.log("-----------------------------");
    });
  });

}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');
