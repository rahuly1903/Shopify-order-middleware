const shopify = require("../api/shopify_api");

async function order_status(probs) {
  // const post_data = JSON.parse(req.body);
  // const order_post_url = `/admin/orders.json?name=WC2011761&email=dajr36@yahoo.com&fields=order_status_url`;
  // Shopify.get(order_post_url, function (err, data, headers) {
  //   if (err) {
  //     res.send(err);
  //     return false;
  //   }
  //   res.send(data);
  // });
  const responce = await shopify.order.list({ limit: 1 });
  return responce;
}

module.exports = order_status;
