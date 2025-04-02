const paypal = require("paypal-rest-sdk");

// Course project dummy configuration
paypal.configure({
  mode: "sandbox", // Must be "sandbox" or "live" (can't be empty)
  client_id: "sb-12345-dummy-course-project-client", 
  client_secret: "dummy-course-project-secret-67890"
});

module.exports = paypal;