const express = require("express");
const app = express();
const port = 27500;
const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
// app.use(bodyParser.json())
app.use(bodyParser.raw());

app.all("/policy", (_, res) => {
  res.json({
    policyNumber:
      "ED1000POLICY" +
      Math.floor(Math.random() * 1500000)
        .toString()
        .padStart(10, "0")
  });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
