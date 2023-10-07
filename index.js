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
app.use(bodyParser.raw({ limit: "50mb", type: "application/json" }));

app.use(cors());

var Shopify = new shopifyAPI({
  shop: process.env.SHOP, // MYSHOP.myshopify.com
  shopify_api_key: process.env.SHOPIFY_API_KEY, // Your API key
  access_token: process.env.ACCESS_TOKEN, // Your API password
});

app.get("/", (req, res) => {
  res.send({ msg: "Welcome to Homepage" });
  axios
    .get("https://api.neoscan.io/api/main_net/v1/get_all_nodes")
    .then((data) => res.json(data))
    .catch((err) => next(err));
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

// vportalwithclarity.com/cyclictestsh
https: app.post("/webhooks/test", (req, res, next) => {
  let data = JSON.stringify({
    data: 1,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://vportalwithclarity.com/cyclictestsh",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/webhooks/order-creation", async (req, res, next) => {
  const data = req.body.toString();
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: process.env.BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  console.log(config.url);
  try {
    const responce = await axios.request(config);
    console.log(responce.status);
  } catch (err) {
    console.log(err);
  }

  try {
    const shopifyHmac = req.headers["x-shopify-hmac-sha256"];
    if (verifyHmac(req.body, shopifyHmac)) {
      res.sendStatus(200); // Respond with a 200 status code
    } else {
      res.sendStatus(403); // Return a 403 Forbidden status if HMAC is not valid
    }
    //test
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
