import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
const app = express();
const port = 27500;
// app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.raw());

const policies = [];

app.all("/policy", (_, res) => {
  const policyNumber = `ED1000POLICY${nanoid()}`
  policies.push(policyNumber);
  res.json({
    policyNumber,
    size: policies.length
  });
  console.info(`Policies Issued: ${policies.length}`);
});
app.all("/:policyId", (req, res) => {
  const { policyId } = req.params;
  const indexPolicy = policies.findIndex(v => v == policyId);
  if (indexPolicy == -1) {
    return res.sendStatus(404);
  }
  const [policyCallback] = policies.splice(indexPolicy, 1);
  res.json({
    policyCallback,
    size: policies.length
  });
  console.warn(`Policies Callback: ${policies.length}`);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
