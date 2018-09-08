/*
 * Copyright 2018 Capability LLC. All Rights Reserved.
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

const CapabilitySDK = require("../index.js");
const CapabilityURI = require("capability-uri");
const events = require("events");
const joi = require("../joi.js");
const pkg = require("../package.json");
const util = require("util");

/*
  * `config`: _Object_ Certificate Manager service configuration.
    * `tls`: _Object_ _(Default: undefined)_ Optional TLS configuration overrides.
      * `trustedCA`: _Object_ _(Default: undefined)_ Optional x509 Certificate
          Authorities to trust explicitly with corresponding PEM CAs. `trustedCA`
          keys are authorities, for example `example.com` and the values are
          PEM CAs in form of strings.
*/
const CertificateManager = module.exports = function(config)
{
    if (!(this instanceof CertificateManager))
    {
        return new CertificateManager(config);
    }
    const self = this;
    events.EventEmitter.call(self);

    self.name = `${pkg.name}:certificate-manager`;
    self.version = pkg.version;

    self.tls =
    {
        trustedCA: (config && config.tls && config.tls.trustedCA) ? config.tls.trustedCA : {}
    };
};

util.inherits(CertificateManager, events.EventEmitter);

CertificateManager.SCHEMA =
{
    createDomain:
    {
        config: joi.object().keys(
            {
                domain: joi.string().max(256).required(),
                capabilities: joi.object().keys(
                    {
                        receiveCertificate: joi.string().capabilityURI().required(),
                        updateChallenge: joi.string().capabilityURI().required()
                    }
                ).required(),
                subject: joi.object().keys(
                    {
                        country: joi.string().min(2).max(2),
                        stateProvince: joi.string().max(128),
                        locality: joi.string().max(128),
                        organization: joi.string().max(64),
                        organizationalUnit: joi.string().max(64)
                    }
                )
            }
        ).required()
    },
    queryDomains:
    {
        query: joi.object().keys(
            {
                domain: joi.string().max(256),
                lastDomain: joi.string().max(256),
                limit: joi.number().integer()
            }
        ).required()
    },
    updateDomain:
    {
        config: joi.object().keys(
            {
                capabilities: joi.object().keys(
                    {
                        receiveCertificate: joi.string().capabilityURI(),
                        updateChallenge: joi.string().capabilityURI()
                    }
                ).required()
            }
        ).required()
    }
};

/*
  * `createDomainCapability`: _Capability URI_ Capability to create domains.
  * `config`: _Object_ Configuration of the domain certificate to create.
    * `domain`: _String_ Fully qualified domain name to issue certificate for.
    * `capabilities`: _Object_ Capabilities for the service to use.
      * `receiveCertificate`: _Capability URI_ Capability the Certificate
          Manager Service will use to deliver the created certificate.
      * `updateChallenge`: _Capability URI_ Capability the Certificate Manager
          Service will use to provide a challenge in order to verify domain name
          ownership.
    * `subject`: _Object_ Subject to use with the created certificate.
      * `country`: _String_ The two-letter ISO country code of the country where
          the organization is located.
      * `stateProvince`: _String_ The state or province where the organization
          is located.
      * `locality`: _String_ The location of the organization, usually a city.
      * `organization`: _String_ Usually the legal incorporated name of a
          company and should include any suffixes such as Ltd., Inc., or Corp.
      * `organizationalUnit`: _String_ e.g. HR, Finance, IT.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `domain`: _String_ Fully qualified domain name for the certificate.
      * `capabilities`: _Object_ Certificate capabilities.
*/
CertificateManager.prototype.createDomain = function(createDomainCapability, config, callback)
{
    const self = this;
    const validation = joi.validate(
        config,
        CertificateManager.SCHEMA.createDomain.config,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(createDomainCapability).authority;
    const body = JSON.stringify(config);
    const options =
    {
        ca: self.tls.trustedCA[authority],
        headers:
        {
            "content-length": Buffer.byteLength(body, "utf8")
        },
        method: "POST"
    };
    CapabilitySDK.requestReply(
        createDomainCapability,
        options,
        body,
        callback
    );
};

/*
  * `deleteDomainCapability`: _Capability URI_ Capability to delete a domain.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.
*/
CertificateManager.prototype.deleteDomain = function(deleteDomainCapability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(deleteDomainCapability).authority;
    CapabilitySDK.requestReply(
        deleteDomainCapability,
        {
            ca: self.tls.trustedCA[authority]
        },
        null,
        callback
    );
};

/*
  * `deleteSelfCapability`: _Capability URI_ Capability to delete self.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.
*/
CertificateManager.prototype.deleteSelf = function(deleteSelfCapability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(deleteSelfCapability).authority;
    CapabilitySDK.requestReply(
        deleteSelfCapability,
        {
            ca: self.tls.trustedCA[authority]
        },
        null,
        callback
    );
};

/*
  * `deliverCertificateCapability`: _Capability URI_ Capability to deliver
      certificate.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.
*/
CertificateManager.prototype.deliverCertificate = function(deliverCertificateCapability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(deliverCertificateCapability).authority;
    CapabilitySDK.requestReply(
        deliverCertificateCapability,
        {
            ca: self.tls.trustedCA[authority]
        },
        null,
        callback
    );
};

/*
  * `queryDomainsCapability`: _Capability URI_ Capability to query domains.
  * `query`: _Object_ _(Default: {})_ Query to execute.
    * `domain`: _String_ _(Default: undefined)_ Domain to query.
    * `lastDomain`: _String_ _(Default: undefined)_ Last domain from previous
        query, used to return more results if there are more results to retrieve.
    * `limit`: _Number_ _(Default: 1)_ Limit on the number of results. The
        number of results will be less than or equal to the `limit`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `domains`: _Array_ An array of domains ordered by `domain`.
      * `completed`: _Boolean_ `true` if no more results, `false` otherwise.
*/
CertificateManager.prototype.queryDomains = function(queryDomainsCapability, query = {}, callback)
{
    const self = this;
    const validation = joi.validate(
        query,
        CertificateManager.SCHEMA.queryDomains.query,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(queryDomainsCapability).authority;
    const body = JSON.stringify(query);
    const options =
    {
        ca: self.tls.trustedCA[authority],
        headers:
        {
            "content-length": Buffer.byteLength(body, "utf8")
        },
        method: "POST"
    };
    CapabilitySDK.requestReply(
        queryDomainsCapability,
        options,
        body,
        callback
    );
};

/*
  * `updateDomainCapability`: _Capability URI_ Capability to update domain.
  * `config`: _Object_ Domain configuration to update.
    * `capabilities`: _Object_ Capabilities for the service to use.
      * `receiveCertificate`: _Capability URI_ Capability the Certificate
          Manager Service will use to deliver the created certificate.
      * `updateChallenge`: _Capability URI_ Capability the Certificate Manager
          Service will use to provide a challenge in order to verify domain name
          ownership.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.
*/
CertificateManager.prototype.updateDomain = function(updateDomainCapability, config, callback)
{
    const self = this;
    const validation = joi.validate(
        config,
        CertificateManager.SCHEMA.updateDomain.config,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(updateDomainCapability).authority;
    const body = JSON.stringify(config);
    const options =
    {
        ca: self.tls.trustedCA[authority],
        headers:
        {
            "content-length": Buffer.byteLength(body, "utf8")
        },
        method: "POST"
    };
    CapabilitySDK.requestReply(
        updateDomainCapability,
        options,
        body,
        callback
    );
};
