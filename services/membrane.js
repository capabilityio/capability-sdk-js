/*
 * Copyright 2017-2018 Capability LLC. All Rights Reserved.
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

const CapabilitySdk = require("../index.js");
const CapabilityURI = require("capability-uri");
const events = require("events");
const http = require("http");
const Joi = require("joi");
const pkg = require("../package.json");
const querystring = require("querystring");
const regex = require("../regex.js");
const util = require("util");

/*
  * `config`: _Object_ Membrane service configuration.
    * `tls`: _Object_ _(Default: undefined)_ Optional TLS configuration overrides.
      * `trustedCA`: _Object_ _(Default: undefined)_ Optional x509 Certificate
          Authorities to trust explicitly with corresponding PEM CAs. `trustedCA`
          keys are authorities, for example `example.com` and the values are
          PEM CAs in form of strings.
*/
const Membrane = module.exports = function(config)
{
    if (!(this instanceof Membrane))
    {
        return new Membrane();
    }
    const self = this;
    events.EventEmitter.call(self);

    self.name = `${pkg.name}:membrane`;
    self.version = pkg.version;

    self.tls =
    {
        trustedCA: (config && config.tls && config.tls.trustedCA) ? config.tls.trustedCA : {}
    };
};

util.inherits(Membrane, events.EventEmitter);

Membrane.SCHEMA =
{
    create:
    {
        membrane: Joi.object().keys(
            {
                id: Joi.string().max(256).required()
            }
        ).required()
    },
    export:
    {
        config: Joi.object().keys(
            {
                allowQuery: Joi.boolean(),
                capability: Joi.string().regex(new RegExp(`^.+/#${regex.base64url.source}$`)).uri(
                    {
                        scheme: [ "cpblty" ]
                    }
                ),
                headers: Joi.object(),
                hmac: Joi.object().keys(
                    {
                        "aws4-hmac-sha256": Joi.object().keys(
                            {
                                awsAccessKeyId: Joi.string().max(128).regex(new RegExp(`^[\\w]+$`)).required(),
                                region: Joi.string().max(128).required(),
                                secretAccessKey: Joi.string().max(256).required(),
                                service: Joi.string().max(128).required()
                            }
                        ),
                        "cap1-hmac-sha512": Joi.object().keys(
                            {
                                key: Joi.string().regex(new RegExp(`^${regex.base64url.source}$`)).required(),
                                keyId: Joi.string().max(256).required()
                            }
                        )
                    }
                ).xor("aws4-hmac-sha256", "cap1-hmac-sha512"),
                method: Joi.string().valid(http.METHODS),
                timeoutMs: Joi.number().integer(),
                tls: Joi.object().keys(
                    {
                        ca: Joi.string(),
                        cert: Joi.string(),
                        key: Joi.string(),
                        rejectUnauthorized: Joi.boolean()
                    }
                ),
                uri: Joi.string().uri(
                    {
                        scheme: [ "http", "https" ]
                    }
                )
            }
        ).xor("capability", "uri").required()
    },
    query: Joi.object().keys(
        {
            id: Joi.string().max(256),
            lastId: Joi.string().max(256),
            limit: Joi.number().integer()
        }
    ).required()
};

/*
  * `createCapability`: _Capability URI_ Capability to create membranes.
  * `membrane`: _Object_ Membrane to create.
    * `id`: _String_ Unique id to assign to the membrane.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `id`: _String_ Membrane id.
      * `capabilities`: _Object_ Membrane capabilities.
*/
Membrane.prototype.create = function(createCapability, membrane, callback)
{
    const self = this;
    const validation = Joi.validate(
        membrane,
        Membrane.SCHEMA.create.membrane,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(createCapability).authority;
    const body = JSON.stringify(membrane);
    const options =
    {
        ca: self.tls.trustedCA[authority],
        headers:
        {
            "content-length": Buffer.byteLength(body)
        },
        method: "POST"
    };
    CapabilitySdk.requestReply(
        createCapability,
        options,
        body,
        callback
    );
};

/*
  * `deleteSelfCapability`: _Capability URI_ Capability to delete self.
  * `callback`: _Function_ `(error) => {}`
    * `error`: _Error_ Error, if any.
*/
Membrane.prototype.deleteSelf = function(deleteSelfCapability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(deleteSelfCapability).authority;
    CapabilitySdk.requestReply(
        deleteSelfCapability,
        {
            ca: self.tls.trustedCA[authority]
        },
        null,
        callback
    );
};

/*
  * `exportCapability`: _Capability URI_ Capability to export capability through
      membrane.
  * `config`: _Object_ Configuration of the capability to export through membrane.
    * `capability`: _Capability URI_ **Mutually exclusive with `uri`.** An
        already existing capability to re-export through this membrane. If this
        membrane is revoked, the original capability will not be revoked. Only
        the capability created during this re-export and any of its descendants
        will be revoked.
    * `uri`: _String_ **Mutually exclusive with `capability`.** Fully qualified
        URI, for example https://example.com/path/to/something
    * `allowQuery` (`uri` option): _Boolean_ _(Default: false)_ Optionally allow
        requester's URI query string to be appended to the `uri` in membrane
        request.
    * `headers` (`uri` option): _Object_ _(Default: undefined)_ Optional headers
        to include with the membrane request to the URI. Hop-by-hop headers will
        be ignored.
    * `hmac` (`uri` option): _Object_ _(Default: undefined)_ Optional selector
        for which signature scheme to use to sign membrane request to URI.
      * `aws4-hmac-sha256`: _Object_ Use AWS4-HMAC-SHA256 signature.
        * `awsAccessKeyId`: _String_ AWS Access Key Id to sign requests with.
        * `region`: _String_ AWS region capability is in.
        * `service`: _String_ AWS service capability is in.
        * `secretAccessKey`: _String_ AWS Secret Access Key to sign requests with.
      * `cap1-hmac-sha512`: _Object_ Use CAP1-HMAC-SHA512 signature.
        * `key`: _String_ Base64url encoded secret key bytes.
        * `keyId`: _String_ Secret key id.
    * `method` (`uri` option): _String_ _(Default: undefined)_ Optional HTTP
        method to use in the membrane request to the URI. This overrides the
        method specified by the requester.
    * `timeoutMs` (`uri` option): _Number_ _(Default: undefined)_ Optional
        timeout in milliseconds to end idle connection between membrane and URI.
        Will be ignored if greater than membrane's configured internal timeout.
    * `tls` (`uri` option): _Object_ _(Default: undefined)_ TLS options.
      * `ca`: _String_ _(Default: undefined)_ Optionally, override default trusted
          Certificate Authorities (CAs). Default is to trust the well-known CAs
          curated by Mozilla. Mozilla's CAs are completely replaced when CA is
          explicitly specified using this option.
      * `cert`: _String_ _(Default: undefined)_ Optional certificate chain in
          PEM format.
      * `key`: _String_ _(Default: undefined)_ Optional private key in PEM
          format.
      * `rejectUnauthorized`: _Boolean_ _(Default: true)_ If not `false`,
          membrane request verifies responding server against the list of
          supplied Certificate Authorities.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `capability`: _Capability URI_ Created capability.
*/
Membrane.prototype.export = function(exportCapability, config, callback)
{
    const self = this;
    const validation = Joi.validate(
        config,
        Membrane.SCHEMA.export.config,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(exportCapability).authority;
    const body = JSON.stringify(config);
    const options =
    {
        ca: self.tls.trustedCA[authority],
        headers:
        {
            "content-length": Buffer.byteLength(body)
        },
        method: "POST"
    };
    CapabilitySdk.requestReply(
        exportCapability,
        options,
        body,
        callback
    );
};

/*
  * `queryCapability`: _Capability URI_ Capability to query membranes.
  * `query`: _Object_ _(Default: {})_ Query to execute.
    * `id`: _String_ _(Default: undefined)_ Id of the membrane to query.
    * `lastId`: _String_ _(Default: undefined)_ Id of the last membrane from
        previous query, used to return more results if there are more results
        to retrieve.
    * `limit`: _Number_ _(Default: 1)_ Limit on the number of results. The
        number of results will be less than or equal to the `limit`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `membranes`: _Array_ An array of membranes ordered by 'id'. Each result
        contains `id` and `capabilities` corresponding to the membrane.
      * `completed`: _Boolean_ `true` if no more results, `false` otherwise.
*/
Membrane.prototype.query = function(queryCapability, query = {}, callback)
{
    const self = this;
    const validation = Joi.validate(
        query,
        Membrane.SCHEMA.query,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(queryCapability).authority;
    const options =
    {
        ca: self.tls.trustedCA[authority]
    };
    if (query.id || query.lastId || query.limit)
    {
        options.path = `/?${querystring.stringify(query)}`;
    };
    CapabilitySdk.requestReply(
        queryCapability,
        options,
        undefined,
        callback
    );
};

/*
  * `revokeCapability`: _Capability URI_ Capability to revoke a membrane.
  * `callback`: _Function_ `(error) => {}`
    * `error`: _Error_ Error, if any.
*/
Membrane.prototype.revoke = function(revokeCapability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(revokeCapability).authority;
    CapabilitySdk.requestReply(
        revokeCapability,
        {
            ca: self.tls.trustedCA[authority]
        },
        null,
        callback
    );
};
