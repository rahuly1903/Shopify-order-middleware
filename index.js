const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

const order_status = require("./order_status/order_status");
const customer_update = require("./customer_update/customer_update");
const order_shipping_date_update = require("./order_shipping_date/order_shipping_date_update");
const middleware_order_data = require("./webhook_order_data/order_data");

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(
  bodyParser.raw({ limit: "50mb", type: "application/json", extended: true })
);

app.use(cors());

app.get("/", (req, res) => {
  res.send({ msg: "Welcome to Homepage" });
});

app.get("/update_shipping_date", (req, res) => {
  res.send({ msg: "update_shipping_date" });
});

// HMAC verification function
function verifyHmac(requestBody, shopifyHmac) {
  const payload = requestBody.toString();
  const hash = crypto
    .createHmac("sha256", process.env.WEBHOOK_API_KEY)
    .update(payload)
    .digest("base64");
  console.log(hash, shopifyHmac);
  return hash === shopifyHmac;
}

app.post("/webhooks/order-creation", async (req, res, next) => {
  const data = req.body.toString();
  // console.log(req.body.toString());
  try {
    const shopifyHmac = req.headers["x-shopify-hmac-sha256"];
    if (verifyHmac(req.body, shopifyHmac)) {
      try {
        middleware_order_data(res, data);
        const responce = await order_shipping_date_update(JSON.parse(data));
        console.log("order_shipping_date_update", responce);
      } catch (error) {
        console.log(error);
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/api/order-shipping-update", async (req, res) => {
  const responce = await order_shipping_date_update();
  console.log(responce);
  res.send(responce);
});

app.post("/api/order-status", async (req, res) => {
  console.log("rahul");
  order_status(req, res);
});

app.post("/api/customer-update", async (req, res) => {
  customer_update(req, res);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
