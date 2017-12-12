# capability-sdk-js

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/capability-sdk-js.png)](http://npmjs.org/package/capability-sdk-js)

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

  * Services
    * [Membrane](services/Membrane.md): create and manage capabilities.

## Releases

### Policy

We follow the semantic versioning policy ([semver.org](http://semver.org/)) with a caveat:

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
>MAJOR version when you make incompatible API changes,<br/>
>MINOR version when you add functionality in a backwards-compatible manner, and<br/>
>PATCH version when you make backwards-compatible bug fixes.

**caveat**: Major version zero is a special case indicating development version that may make incompatible API changes without incrementing MAJOR version.
