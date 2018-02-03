/*
 * Copyright 2017 Capability LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

const events = require("events");
const https = require("https");
const pkg = require("./package.json");
const util = require("util");

const CapabilitySdk = module.exports = function(config = {})
{
    if (!(this instanceof CapabilitySdk))
    {
        return new CapabilitySdk(config);
    }
    const self = this;
    events.EventEmitter.call(self);

    self._config = config;

    self.name = pkg.name;
    self.version = pkg.version;
};

util.inherits(CapabilitySdk, events.EventEmitter);

/*
  * `capability`: _Capability URI_ Capability to use.
  * `options`: _Object_ HTTPS request options, if any. Hostname, port, and
      authorization header will be overriden by the specified `capability`.
  * `callback`: _Function_ `(resp) => {}` _(Default: undefined)_ Optional
      callback that will be added as one time listener for the "response" event.
  * Return: _http.ClientRequest_ Node.js HTTP ClientRequest object.
*/
CapabilitySdk.request = (capability, options, callback) =>
{
    const uri = CapabilityUri.parse(capability);
    if (!uri.authority)
    {
        throw new Error(`Unable to determine capability authority to use for HTTPS request`);
    }
    const uriParts = uri.authority.split(":");
    const reqOptions = options || {};
    reqOptions.hostname = uriParts[0];
    if (uriParts[1])
    {
        reqOptions.port = uriParts[1];
    }
    reqOptions.headers = reqOptions.headers || {};
    reqOptions.headers = Object.keys(reqOptions.headers)
        .map(key => [key, reqOptions.headers[key]])
        .filter(([name, value]) => name.toLowerCase() != "authorization")
        .reduce((headers, [name, value]) =>
            {
                headers[name] = value;
                return headers;
            },
            {}
        );
    reqOptions.headers.authorization = `Bearer ${uri.capabilityToken.serialize()}`;
    reqOptions.agent = new https.Agent(reqOptions);
    return https.request(reqOptions, callback);
};

CapabilitySdk.SERVICES =
[
    "membrane"
];

CapabilitySdk.Membrane = require("./services/membrane.js");
