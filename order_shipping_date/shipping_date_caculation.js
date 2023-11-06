var calculator = {
  workDaysAdded: 0,
  month: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
  monthFull: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  weekday: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
  weekdayFull: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  ukHolidays: ["2023-11-23", "2023-11-24", "2023-12-25", "2024-01-01"], //"2023-05-23", "2023-05-24"
  startDate: null,
  curDate: null,

  addWorkDay: function () {
    this.curDate.setDate(this.curDate.getDate() + 1);
    if (
      this.ukHolidays.indexOf(this.formatDate(this.curDate)) === -1 &&
      this.curDate.getDay() !== 0 &&
      this.curDate.getDay() !== 6
    ) {
      this.workDaysAdded++;
    }
  },

  formatDate: function (date) {
    var day = date.getDate(),
      month = date.getMonth() + 1;

    month = month > 9 ? month : "0" + month;
    day = day > 9 ? day : "0" + day;
    return date.getFullYear() + "-" + month + "-" + day;
  },

  getNewWorkDay: function (daysToAdd) {
    this.startDate = new Date();
    this.curDate = new Date();
    this.workDaysAdded = 0;

    while (this.workDaysAdded < daysToAdd) {
      this.addWorkDay();
    }
    return [
      this.weekday[this.curDate.getDay()],
      this.month[this.curDate.getMonth()],
      this.curDate.getDate(),
      this.weekdayFull[this.curDate.getDay()],
      this.monthFull[this.curDate.getMonth()],
    ];
  },
};
function calculateShippingDate(value) {
  const value_in_number = value.split(" ")[0];
  console.log(value_in_number);
  const newWorkDay = calculator.getNewWorkDay(value_in_number);
  return newWorkDay;
}
function insertShippingDateInOrder(order_data_json) {
  const rich_text_json = {
    type: "root",
    children: [],
  };
  const order_items = order_data_json.line_items;
  order_items.map(function (line_item) {
    let { properties, sku } = line_item;
    if (properties.length) {
      properties.map(function (property) {
        if (property.name.indexOf("Ship In") > -1) {
          let newWorkDayProduct = calculateShippingDate(property.value);
          console.log(newWorkDayProduct);
          rich_text_json.children.push({
            type: "paragraph",
            children: [
              { type: "text", value: `${sku} -` },
              {
                type: "text",
                value: `${newWorkDayProduct[3]}, ${newWorkDayProduct[4]} ${newWorkDayProduct[2]}`,
                bold: true,
              },
            ],
          });
        }
      });
    }
  });

  return rich_text_json;
}

module.exports = insertShippingDateInOrder;
