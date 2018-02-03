# capability-sdk

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/capability-sdk.png)](http://npmjs.org/package/capability-sdk)

Capability SDK for Node.js.

## Contents

  * [Installation](#installation)
  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
    * Services
      * [Membrane](services/Membrane.md): create and manage capabilities.
  * [Releases](#releases)

## Installation

    npm install capability-sdk

## Usage

SDK can be `require`'d in your Node.js application via `require()`.

```javascript
const CapabilitySdk = require("capability-sdk");
```

## Tests

No tests at this time.

## Documentation

  * [CapabilitySdk.request(capability, options, callback)](#capabilitysdkrequestcapability-options-callback)
  * Services
    * [Membrane](services/Membrane.md): create and manage capabilities.

#### CapabilitySdk.request(capability, options, callback)

  * `capability`: _Capability URI_ Capability to use.
  * `options`: _Object_ HTTPS request options, if any. Hostname, port, and authorization header will be overriden by the specified `capability`.
  * `callback`: _Function_ `(resp) => {}` _(Default: undefined)_ Optional callback that will be added as one time listener for the "response" event.
  * Return: _http.ClientRequest_ Node.js HTTP ClientRequest object.

Creates an HTTPS request using the provided `capability` and HTTP `options`. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-aqp9nlT7a22dTGhks8vXMJNabKyIZ_kAES6U87Ljdg73xXiatBzgu5tImuWjFMXicgYb3Vpo0-C6mbm5_uFtAA"
const req = CapabilitySdk.request(capability);
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

## Releases

### Policy

We follow the semantic versioning policy ([semver.org](http://semver.org/)) with a caveat:

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
>MAJOR version when you make incompatible API changes,<br/>
>MINOR version when you add functionality in a backwards-compatible manner, and<br/>
>PATCH version when you make backwards-compatible bug fixes.

**caveat**: Major version zero is a special case indicating development version that may make incompatible API changes without incrementing MAJOR version.
