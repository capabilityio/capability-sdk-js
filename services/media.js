/*
 * Copyright 2019 Capability LLC. All Rights Reserved.
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

const Media = module.exports = function(config)
{
    if (!(this instanceof Media))
    {
        return new Media(config);
    }
    const self = this;
    events.EventEmitter.call(self);

    self.name = `${pkg.name}:media`;
    self.version = pkg.version;

    self.tls =
    {
        trustedCA: (config && config.tls && config.tls.trustedCA) ? config.tls.trustedCA : {}
    };
};

util.inherits(Media, events.EventEmitter);

Media.SCHEMA =
{
    createEmail:
    {
        config: joi.object().keys(
            {
                customId: joi.string().max(512).required(),
                derivedId: joi.string().max(512).required(),
                email: joi.string().email().required()
            }
        ).required()
    },
    createEmailDomainIdentity:
    {
        config: joi.object().keys(
            {
                domain: joi.string().max(512).required()
            }
        ).required()
    },
    getEmailCustomId:
    {
        derivedId: joi.string().max(512).required()
    },
    queryEmailDomainIdentities:
    {
        query: joi.object().keys(
            {
                domain: joi.string().max(512),
                lastDomain: joi.string().max(512),
                limit: joi.number().integer()
            }
        ).required()
    },
    sendEmail:
    {
        replyToAddresses: joi.array().items(joi.string().email()),
        returnPath: joi.string().email(),
        source: joi.string().email().required()
    }
};
Media.SCHEMA.sendEmail.content = joi.object().keys(
    {
        charset: joi.string(),
        data: joi.string().required()
    }
);
Media.SCHEMA.sendEmail.body = joi.object().keys(
    {
        html: Media.SCHEMA.sendEmail.content,
        text: Media.SCHEMA.sendEmail.content
    }
).required();
Media.SCHEMA.sendEmail.message = joi.object().keys(
    {
        body: Media.SCHEMA.sendEmail.body,
        subject: Media.SCHEMA.sendEmail.content.required()
    }
).required();
Media.SCHEMA.sendEmail.config = joi.object().keys(
    {
        message: Media.SCHEMA.sendEmail.message,
        replyToAddresses: Media.SCHEMA.sendEmail.replyToAddresses,
        returnPath: Media.SCHEMA.sendEmail.returnPath,
        source: Media.SCHEMA.sendEmail.source
    }
).required();

/*
  * `capability`: _Capability URI_ Capability to create an email.
  * `config`: _Object_ Configuration of the email to create.
    * `customId`: _String_ Unique identifier for the email address that is
        independent (not derived) from the email. For example, a random uuid.
        It is safe to save this identifier in your stores along with the
        `capabilities` returned from this call.
    * `derivedId`: _String_ Unique identifier for the email address that is
        derived from the email address. For example, a hash or an HMAC where
        the email address is one of the inputs. Do not save this identifier
        in your stores. When given an `email`, generate a `derivedId` to
        retrieve `customId` via `getEmailCustomId()`. Then, use the returned
        `customId` to identify the `sendEmail` capability stored in your stores.
    * `email`: _String_ Email address. Do not save this in your stores.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `capabilities`: _Object_ Email capabilities.
      * `customId`: _String_ The `customId` provided when making this call.
*/
Media.prototype.createEmail = function(capability, config, callback)
{
    const self = this;
    const validation = joi.validate(
        config,
        Media.SCHEMA.createEmail.config,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(capability).authority;
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
    CapabilitySDK.requestReply(capability, options, body, callback);
};

/*
  * `capability`: _Capability URI_ Capability to create EmailDomainIdentity.
  * `config`: _Object_ Configuration of the EmailDomainIdentity to create.
    * `domain`: _String_ Email domain to send emails from. For example
        `example.com`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `capabilities`: _Object_ EmailDomainIdentity capabilities.
      * `domain`: _String_ The `domain` provided when making this call.
      * `verificationToken`: _String_ A TXT record that you must place in the
          DNS settings of the domain to complete domain verification.
*/
Media.prototype.createEmailDomainIdentity = function(capability, config, callback)
{
    const self = this;
    const validation = joi.validate(
        config,
        Media.SCHEMA.createEmailDomainIdentity.config,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(capability).authority;
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
    CapabilitySDK.requestReply(capability, options, body, callback);
};

/*
  * `capability`: _Capability URI_ Capability to delete an email.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.
*/
Media.prototype.deleteEmail = function(capability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(capability).authority;
    const options =
    {
        ca: self.tls.trustedCA[authority]
    };
    CapabilitySDK.requestReply(capability, options, null, callback);
};

/*
  * `capability`: _Capability URI_ Capability to delete an EmailDomainIdentity.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.
*/
Media.prototype.deleteEmailDomainIdentity = function(capability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(capability).authority;
    const options =
    {
        ca: self.tls.trustedCA[authority]
    };
    CapabilitySDK.requestReply(capability, options, null, callback);
};

/*
  * `capability`: _Capability URI_ Capability to delete self.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.
*/
Media.prototype.deleteSelf = function(capability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(capability).authority;
    const options =
    {
        ca: self.tls.trustedCA[authority]
    };
    CapabilitySDK.requestReply(capability, options, null, callback);
};

/*
  * `capability`: _Capability URI_ Capability to retrieve `customId`s for an
      EmailDomainIdentity.
  * `derivedId`: _String_ Unique identifier for the email address that is
        derived from the email address. For example, a hash or an HMAC where
        the email address is one of the inputs. `derivedId` must match the
        `derivedId` used when creating the email.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `customId`: _String_ `customId` corresponding to provided `derivedId`.
*/
Media.prototype.getEmailCustomId = function(capability, derivedId, callback)
{
    const self = this;
    const validation = joi.validate(
        derivedId,
        Media.SCHEMA.getEmailCustomId.derivedId,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(capability).authority;
    const body = JSON.stringify({ derivedId });
    const options =
    {
        ca: self.tls.trustedCA[authority],
        headers:
        {
            "content-length": Buffer.byteLength(body, "utf8")
        },
        method: "POST"
    };
    CapabilitySDK.requestReply(capability, options, body, callback);
};

/*
  * `capability`: _Capability URI_ Capability to retrieve EmailDomainIdentity
      verification status.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `domain`: _String_ The `domain` being verified.
      * `verificationStatus`: _String_ The verification status. One of
          `Pending`, `Success`, `Failed`, `TemporaryFailure`, `NotStarted`.
      * `verificationToken`: _String_ A TXT record that you must place in the
          DNS settings of the domain to complete domain verification.
*/
Media.prototype.getVerificationStatus = function(capability, callback)
{
    const self = this;
    const authority = CapabilityURI.parse(capability).authority;
    const options =
    {
        ca: self.tls.trustedCA[authority]
    };
    CapabilitySDK.requestReply(capability, options, null, callback);
};

/*
  * `capability`: _Capability URI_ Capability to query EmailDomainIdentities.
  * `query`: _Object_ _(Default: {})_ Query to execute.
    * `domain`: _String_ _(Default: undefined)_ Domain to query.
    * `lastDomain`: _String_ _(Default: undefined)_ Last domain from previous
        query, used to return more results if there are more results to retrieve.
    * `limit`: _Number_ _(Default: 1)_ Limit on the number of results. The
        number of results will be less than or equal to the `limit`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `domains`: _Array_ An array of EmailDomainIdentities ordered by `domain`.
      * `completed`: _Boolean_ `true` if no more results, `false` otherwise.
*/
Media.prototype.queryEmailDomainIdentities = function(capability, query = {}, callback)
{
    const self = this;
    const validation = joi.validate(
        query,
        Media.SCHEMA.queryEmailDomainIdentities.query,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(capability).authority;
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
    CapabilitySDK.requestReply(capability, options, body, callback);
};

/*
  * `capability`: _Capability URI_ Capability to send an email.
  * `config`: _Object_ Configuration of email to send.
    * `message`: _Object_ Message to be sent.
      * `body`: _Object_ The message body.
        * `html`: _Object_ The content of the message, in HTML format.
          * `charset`: _String_ _(Default: 7-bit ASCII)_ The character set of
              the content. For example: UTF-8, ISO-8859-1, Shift_JIS.
          * `data`: _String_ The actual text.
        * `text`: _Object_ The content of the message, in text format.
          * `charset`: _String_ _(Default: 7-bit ASCII)_ The character set of
              the content. For example: UTF-8, ISO-8859-1, Shift_JIS.
          * `data`: _String_ The actual text.
      * `subject`: _Object_ The subject of the message.
          * `charset`: _String_ _(Default: 7-bit ASCII)_ The character set of
              the content. For example: UTF-8, ISO-8859-1, Shift_JIS.
          * `data`: _String_ The actual text.
    * `replyToAddresses`: _Array_ _(Default: undefined)_ The reply-to email
        address(es) for the message. If the recipient replies to the message,
        each reply-to address will receive the reply.
    * `returnPath`: _String_ _(Default: undefined)_ The email address that
        bounces and complaints will be forwarded to when feedback forwarding is
        enabled. If the message cannot be delivered to the recipient, then an
        error message will be returned from the recipient's ISP; this message
        will then be forwarded to the email address specified by the
        `returnPath` parameter. The `returnPath` parameter is never overwritten.
        This email address must be from an EmailDomainIdentity domain that has
        been verified.
    * `source`: _String_ The email address that is sending the email. This email
        address must be from an EmailDomainIdentity domain that has been
        verified.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `messageId`: _String_ Unique identifier for the sent email.
*/
Media.prototype.sendEmail = function(capability, config, callback)
{
    const self = this;
    const validation = joi.validate(
        config,
        Media.SCHEMA.sendEmail.config,
        {
            convert: false
        }
    );
    if (validation.error)
    {
        return callback(validation.error);
    }
    const authority = CapabilityURI.parse(capability).authority;
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
    CapabilitySDK.requestReply(capability, config, body, callback);
};
