# StressTest

This project exposes a small Express server used for stress testing callbacks.

## Requirements

- Node.js 20 or later
- npm

## Installation

```bash
npm install
```

## Running the Service

Start the server with:

```bash
npm start
```

For development with automatic reloads use:

```bash
npm run start:watch
```

The service listens on **port 27500**.

## Environment Variables

- `POLICY_HANDLING_SERVICE` – base URL of the policy handling service that will receive callback requests from `/callback/:processId` when a `policyNumber` is present in the body.

## Endpoints

### `POST /policy`
Issues a new policy. The response status may randomly be **200**, **400** or **429** to simulate different scenarios. When successful, the body contains `policyNumber`, `orderId`, `status` and `street`. If `callback_url` is provided, the service will POST the same payload to that URL after a short delay.

### `POST /cb5d8aa6-c9f4-4517-87d9-3a92a2fc1262`
Simulates the policy callback endpoint. Provide a `policyNumber` in the request body. If the policy exists it is removed from the queue and returned in the response; otherwise a **404** is sent.

### `POST /callback/:processId`
Receives a callback payload identified by `processId`. After processing the body it forwards the data either to the local callback endpoint or to `${POLICY_HANDLING_SERVICE}/policy/callback/:processId` and also posts the payload to a webhook for inspection.
