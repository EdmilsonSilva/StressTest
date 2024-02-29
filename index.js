import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import timeout from "connect-timeout";
const app = express();
const port = 27500;
// app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.raw());
app.use(timeout('25s'));

const Reset = "\x1b[0m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"

const policies = [];
let policyAmount = 1;
let callbackAmount = 1;

app.all("/policy", (req, res, next) => {
  if (req.timedout) {
    return next();
  }
  const policyNumber = `ED1000POLICY${nanoid()}`
  policies.push(policyNumber);
  res.json({
    policyNumber,
    // data: "X".repeat(1043916),
    //1048576
    size: policies.length
  });
  console.info(`${FgYellow}Issued: ${policyAmount++} - ${policyNumber} Total: ${policies.length}${Reset}`);
});
app.all("/cb5d8aa6-c9f4-4517-87d9-3a92a2fc1262", (req, res) => {
  const { policyNumber } = req.body;
  const indexPolicy = policies.findIndex(v => v == policyNumber);
  if (indexPolicy == -1) {
    return res.sendStatus(404);
  }
  const [policyCallback] = policies.splice(indexPolicy, 1);
  res.json({
    policyNumber: policyCallback,
    size: policies.length
  });
  console.warn(`${FgGreen}Callback: ${callbackAmount++} - ${policyCallback} Total:${policies.length}${Reset}`);
});
app.listen(port, () => {
  console.log(`EdCarrier app listening on port ${port}`);
});
