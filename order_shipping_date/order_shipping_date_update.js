const shopify = require("../api/shopify_api");
const shipping_caculation = require("./shipping_date_caculation");
const order_json = require("../order.json");

async function order_shipping_update(props) {
  try {
    // console.log(props);
    const order_onwer_id = props?.id || order_json.order.id;
    const item_shipping_date = shipping_caculation(props || order_json.order);
    console.log(
      "item_shipping_date - children",
      item_shipping_date.children[0]
    );
    console.log("item_shipping_date - parent", item_shipping_date);
    const responce = await shopify.metafield.create({
      key: "delivery_date_richtext",
      value: JSON.stringify(item_shipping_date),
      type: "rich_text_field",
      description: '{"mgType":"multi_line_text_field","mode":"source"}',
      namespace: "custom",
      owner_resource: "order",
      owner_id: order_onwer_id,
    });
    // const responce = await shopify.metafield.list({
    //   metafield: { owner_resource: "order", owner_id: order_onwer_id },
    // });
    return responce;
  } catch (error) {
    console.log(error);
  }
}

module.exports = order_shipping_update;
