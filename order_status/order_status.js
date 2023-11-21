const Shopify = require("../api/shopify_old_api");

async function order_status(req, res) {
  // const post_data = JSON.parse(req.body);
  console.log(req.body);
  const { order_name, order_email } = req.body;
  // res.send({ responce: "Rahul" });
  // return false;
  const order_post_url = `/admin/api/2020-04/orders.json?name=${order_name}&email=${order_email}&fields=order_status_url`;
  const orders = Shopify.get(order_post_url, function (err, data, headers) {
    console.log("data", data);
    if (err) {
      return { err };
    }
    res.send(data.orders[0]);
  });
}

module.exports = order_status;
