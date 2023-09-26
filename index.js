const express = require("express");
const crypto = require("crypto");
const shopifyAPI = require("shopify-node-api");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// parse application/json
app.use(bodyParser.raw({ limit: "50mb",type: "application/json" }));

app.use(cors());

var Shopify = new shopifyAPI({
  shop: process.env.SHOP, // MYSHOP.myshopify.com
  shopify_api_key: process.env.SHOPIFY_API_KEY, // Your API key
  access_token: process.env.ACCESS_TOKEN, // Your API password
});

app.get("/", (req, res) => {
  res.send({ msg: "Welcome to Homepage" });
});

// HMAC verification function
function verifyHmac(requestBody, shopifyHmac) {
  const payload = requestBody.toString();
  const hash = crypto.createHmac('sha256', process.env.WEBHOOK_API_KEY).update(payload).digest('base64');
  console.log(hash,shopifyHmac);
  return hash === shopifyHmac;
}

app.post("/webhooks/order-creation", async (req, res, next) => {
  const data = req.body.toString();
  const payload = JSON.parse(data);
  try {
    axios.post(process.env.BASE_URL, payload)
		.then(response => {
			console.log(response.data);
		})
		.catch((err) => {
			console.log({ message: err.message });
		});
  } catch (error) {
    console.error(error);
  }
  try {
    const shopifyHmac = req.headers['x-shopify-hmac-sha256'];
    if (verifyHmac(req.body, shopifyHmac)) {
      // console.log(payload);
      console.log(payload.line_items)
      res.sendStatus(200); // Respond with a 200 status code
    } else {
      res.sendStatus(403); // Return a 403 Forbidden status if HMAC is not valid
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Return a 500 Internal Server Error for any unexpected errors
  }
});

app.post("/api/create-product", async (req, res) => {
  const post_data = JSON.parse(req.body);
  Shopify.post(
    "/admin/products.json",
    post_data,
    function (err, data, headers) {
      if (err) {
        res.send(err);
        return false;
      }
      res.send(data);
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

