import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import timeout from "connect-timeout";

const { POLICY_HANDLING_SERVICE: phs } = process.env;
const app = express();
const port = 27500;
// app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.raw());
app.use(timeout('600s'));

const Reset = "\x1b[0m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"
const FgBlue = "\x1b[34m"

const policies = [];
let policyAmount = 1;
let callbackAmount = 1;
let attempts = 0;

app.post("/policy", (req, res, next) => {
  if (req.timedout) {
    return next();
  }
  const random = Math.floor(Math.random() * 100) + 1;
  const { callback_url, status, street } = req.body;
  // if (attempts < 2) {
  //   attempts++;
  //   const interval1 = setInterval(() => { console.count('attempts') }, 1000);
  //   setTimeout(() => {
  //     clearInterval(interval1);
  //     console.countReset('attempts');
  //     return res.sendStatus(429);
  //   }, 5000);
  //   return;
  // }
  const even = random % 2 === 0;
  const odd = random % 2 === 1;
  if (odd) {
    setTimeout(() => {
      res.status(200).json({status, street});
    }, 3000);
  } else {
    const policyNumber = `ED1000POLICY${nanoid()}`;
    const interval = setInterval(() => { console.count(policyNumber) }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      console.countReset(policyNumber);
      policies.push(policyNumber);
      const body = {
        policyNumber: even ? policyNumber : void 0,
        orderId: even ? policyNumber : void 0,
        callback_url,
        // data: "X".repeat(1043916),
        //1048576
        status,
        street,
        size: policies.length
      };
      res.status(200).json(body);
      console.info(`${FgYellow}Issued: ${policyAmount++} - ${policyNumber} Total: ${policies.length}${Reset}`);
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
      if (callback_url) {
        setTimeout(() => {
          fetch(`${callback_url}`, options);
        }, 3000);
      }
    }, 6000);
  }
});
app.all("/cb5d8aa6-c9f4-4517-87d9-3a92a2fc1262", (req, res) => {
  const { policyNumber } = req.body;
  const indexPolicy = policies.findIndex(v => v == policyNumber);
  if (indexPolicy === -1) {
    console.log(`${FgRed}404 - policyNumber: ${policyNumber}${Reset}`);
    return res.sendStatus(404);
  }
  const size = policies.length;
  const [policyCallback] = policies.splice(indexPolicy, 1);
  console.warn(`${FgGreen}Starting Callback... ${callbackAmount++} - ${policyCallback} Total:${size}${Reset}`);
  const interval = setInterval(() => { console.count(policyCallback) }, 1000);
  setTimeout(() => {
    clearInterval(interval);
    console.countReset(policyCallback);
    res.json({
      policyNumber: policyCallback,
      size: policies.length
    });
    console.warn(`${FgGreen}End Callback: ${callbackAmount++} - ${policyCallback} Total:${policies.length}${Reset}`);
  }, 7000);
});
app.all("/callback/:processId", (req, res) => {
  const { processId } = req.params;
  const body = req.body;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
  console.warn(`${FgBlue}Starting Callback process - ${processId}${Reset}`);
  const interval = setInterval(() => { console.count(processId) }, 1000);
  setTimeout(() => {
    clearInterval(interval);
    console.countReset(processId);
    if (body.policyNumber){
      setTimeout(()=> {
        fetch(`${phs}/policy/callback/${processId}`, options);
      }, 3000);
    }
    // else {
    //  fetch(`https://27500-edmilsonsilv-stresstest-pu1oq4oaxpr.ws-eu116.gitpod.io/cb5d8aa6-c9f4-4517-87d9-3a92a2fc1262`, options);
    // }
    setTimeout(()=> {
      fetch(`https://webhook.site/05f7fce3-004e-4ab4-96e8-1d5014c19121/${processId}`, options);
    }, 3000);
    res.status(200).json({ status: 200, success: true, message: "" });
  }, 7000);
});
app.listen(port, () => {
  console.log(`EdCarrier app listening on port ${port}`);
});
