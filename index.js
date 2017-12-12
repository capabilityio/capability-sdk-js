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

CapabilitySdk.SERVICES =
[
    "membrane"
];

CapabilitySdk.Membrane = require("./services/membrane.js");
