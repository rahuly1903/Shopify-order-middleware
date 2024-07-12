const axios = require("axios");
function order_data(data) {
  console.log("order_data");
  console.log(process.env.BASE_URL);
  try {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    axios
      .request(config)
      .then((response) => {
        console.log("sendStatus 200");
      })
      .catch((error) => {
        console.log(error);
        console.log("sendStatus 500");
      });
  } catch (error) {
    console.error(error);
  }
}

module.exports = order_data;
