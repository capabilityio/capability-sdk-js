# capability-sdk

_Stability: 0 - [Deprecated](https://github.com/tristanls/stability-index#stability-0---deprecated)_

[![NPM version](https://badge.fury.io/js/capability-sdk.png)](http://npmjs.org/package/capability-sdk)

Capability SDK for Node.js.

## Contents

  * [Installation](#installation)
  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
    * [CapabilitySDK.request(capability, options, callback)](#capabilitysdkrequestcapability-options-callback)
    * [CapabilitySDK.requestReply(capability, options, data, callback)](#capabilitysdkrequestreplycapability-options-data-callback)
    * [CapabilitySDK.version](#capabilitysdkversion)
    * Services
      * [Certificate Manager](services/CertificateManager.md): create and manage TLS certificates.
      * [Media](services/Media.md): send transactional emails to customers without having to store their email addresses or other Personally Identifiable Information (PII).
      * [Membrane](services/Membrane.md): create and manage capabilities.
  * [Releases](#releases)

## Installation

    npm install capability-sdk

## Usage

SDK can be `require`'d in your Node.js application via `require()`.

```javascript
const CapabilitySDK = require("capability-sdk");
```

## Tests

No tests at this time.

## Documentation

  * [CapabilitySDK.request(capability, options, callback)](#capabilitysdkrequestcapability-options-callback)
  * [CapabilitySDK.requestReply(capability, options, data, callback)](#capabilitysdkrequestreplycapability-options-data-callback)
  * [CapabilitySDK.version](#capabilitysdkversion)
  * Services
    * [Certificate Manager](services/CertificateManager.md): create and manage TLS certificates.
    * [Media](services/Media.md): send transactional emails to customers without having to store their email addresses or other Personally Identifiable Information (PII).
    * [Membrane](services/Membrane.md): create and manage capabilities.

#### CapabilitySDK.request(capability, options, callback)

  * `capability`: _Capability URI_ Capability to use.
  * `options`: _Object_ HTTPS request options, if any. Hostname, port, and authorization header will be overriden by the specified `capability`.
  * `callback`: _Function_ `(resp) => {}` _(Default: undefined)_ Optional callback that will be added as one time listener for the "response" event.
  * Return: _http.ClientRequest_ Node.js HTTP ClientRequest object.

Creates an HTTPS request using the provided `capability` and HTTP `options`. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-aqp9nlT7a22dTGhks8vXMJNabKyIZ_kAES6U87Ljdg73xXiatBzgu5tImuWjFMXicgYb3Vpo0-C6mbm5_uFtAA";
const req = CapabilitySDK.request(capability);
req.on("response", resp =>
    {
        console.log(`STATUS: ${resp.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
        resp.setEncoding('utf8');
        resp.on("data", chunk => console.log(`BODY: ${chunk}`));
        resp.on("end", () => console.log("No more data in response."));
    }
);
req.on("error", error =>
    {
        console.error(`problem with request: ${error.message}`);
    }
);
req.write("my data to write");
req.end();
```

#### CapabilitySDK.requestReply(capability, options, data, callback)

  * `capability`: _Capability URI_ Capability to use.
  * `options`: _Object_ HTTPS request options, if any. Hostname, port, and authorization header will be overriden by the specified `capability`.
  * `data`: _String_ _(Default: undefined)_ Request data to send, if any.
  * `callback`: _Function_ `(error, resp) => {}`
    * `error`: _Error_ Error, if any.
    * `resp`: _Object_ Response object.

Creates an HTTPS request, sends `data` in the request, awaits JSON response, parses JSON response and/or error and calls `callback` with error or response. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-hcghmWpaSIR6mi7Qf1wTm4StWzckTNeYoVZhmyCZ9p5tkjrgpFS1hXOo3nQ60exxooUhX9Oo6JJVuAMlVFiNkg";
const payload = JSON.stringify({hi: "o/"});
CapabilitySDK.requestReply(
    capability,
    {
        headers:
        {
            "Content-Length": Buffer.byteLength(payload, "utf8")
        }
    },
    payload,
    (error, resp) =>
    {
        if (error)
        {
            console.error(error);
        }
        console.log(resp);
    }
);
```

#### CapabilitySDK.version

Property containing the `capability-sdk` module version being used.

## Releases

### Policy

We follow the semantic versioning policy ([semver.org](http://semver.org/)) with a caveat:

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
>MAJOR version when you make incompatible API changes,<br/>
>MINOR version when you add functionality in a backwards-compatible manner, and<br/>
>PATCH version when you make backwards-compatible bug fixes.

**caveat**: Major version zero is a special case indicating development version that may make incompatible API changes without incrementing MAJOR version.
