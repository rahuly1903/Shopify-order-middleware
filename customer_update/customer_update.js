const Shopify = require("../api/shopify_old_api");
async function order_status(req, res) {
  // const post_data = JSON.parse(req.body);
  console.log(req.body);
  const { email, tags } = req.body;
  // res.send({ responce: "Rahul" });
  // return false;
  const order_post_url = `/admin/api/2024-07/customers/search.json?query=email:${email}`;
  let customerId, customerTags;
  Shopify.get(order_post_url, function (err, data, headers) {
    if (!data.customers.length) {
      console.log("Customer not found");
      res.send({ msg: "Customer not fount" }); // Send an empty array to the user.  We will not update customerTags here.  CustomerTags will be updated in Shopify's API.  If customer is not found, we will return an empty array in Shopify's API response.  But, for now, we will not return anything here.  Shopify will return an empty array.  So, we can remove this return statement.  But, if you want to return an error message to the
      return; // Return early if customer not found.  Shopify will return an empty array.  We don't want to make unnecessary API calls.  Also, customerTags will not be updated.  But we do not need to handle this case here.  It will be handled by Shopify's API itself.  We can still send a response to the user if we want.  We will not update customerTags here.  CustomerTags will be updated in Shopify's API.  If customer is not found, we will return an empty array in Shopify's API response.  But in our case, we will not return anything here.  Shopify will return an empty array.  So, we can remove this return statement.  But, if you want to return an error message to the user, you can add this return statement.  But, for now, we will not return anything here.  Shopify willß
    }
    if (err) {
      return { err };
    }
    customerId = data.customers[0].id;
    customerTags = data.customers[0].tags;
    let newTags = [];
    if (customerTags.indexOf("Unsubscribe") > -1) {
      customerTags.split(",").forEach((element) => {
        if (element.indexOf("Unsubscribe") < 0) {
          newTags.push(element);
        }
      });
    } else {
      newTags = customerTags;
    }
    const updatedTags = newTags + "," + tags;
    const accept_marketing =
      updatedTags.indexOf("Unsubscribe") > -1 ? false : true;
    const customerData = {
      customer: {
        tags: updatedTags,
        accept_marketing,
      },
    };
    const customrData = Shopify.put(
      `/admin/api/2024-07/customers/${customerId}.json`,
      customerData,
      function (err, data, headers) {
        if (err) {
          console.log(err);
          return { err };
        }
        res.send({ msg: "Customer is updated successfully" });
      }
    );
  });

  //   res.send(customrData);
}

module.exports = order_status;
