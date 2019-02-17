# Media Service

Media Service enables sending transactional emails to customers without having to store their email addresses or other Personally Identifiable Information (PII).

Media Service can be constructed using the SDK as follows:
```javascript
const CapabilitySDK = require("capability-sdk");
const media = new CapabilitySDK.Media();
```

Once an instance of Media Service is created, you can use it to make calls to the Media Service.

* [media.createEmail(capability, config, callback)](#mediacreateemailcapability-config-callback)
* [media.createEmailDomainIdentity(capability, config, callback)](#mediacreateemaildomainidentitycapability-config-callback)
* [media.deleteEmail(capability, callback)](#mediadeleteemailcapability-callback)
* [media.deleteEmailDomainIdentity(capability, callback)](#mediadeleteemaildomainidentitycapability-callback)
* [media.deleteSelf(capability, callback)](#mediadeleteselfcapability-callback)
* [media.getEmailCustomId(capability, derivedId, callback)](#mediagetemailcustomidcapability-derivedid-callback)
* [media.getVerificationStatus(capability, callback)](#mediagetverificationstatuscapability-callback)
* [media.queryEmailDomainIdentities(capability, query, callback)](#mediaqueryemaildomainidentitiescapability-query-callback)
* [media.sendEmail(capability, config, callback)](#mediasendemailcapability-config-callback)

#### media.createEmail(capability, config, callback)

  * `capability`: _Capability URI_ Capability to create an email.
  * `config`: _Object_ Configuration of the email to create.
    * `customId`: _String_ Unique identifier for the email address that is independent (not derived) from the email. For example, a random uuid. It is safe to save this identifier in your stores along with the `capabilities` returned from this call.
    * `derivedId`: _String_ Unique identifier for the email address that is derived from the email address. For example, a hash or an HMAC where the email address is one of the inputs. Do not save this identifier in your stores. When given an `email`, generate a `derivedId` to retrieve `customId` via `getEmailCustomId()`. Then, use the returned `customId` to identify the `sendEmail` capability stored in your stores.
    * `email`: _String_ Email address. Do not save this in your stores.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `capabilities`: _Object_ Email capabilities.
      * `customId`: _String_ The `customId` provided when making this call.

Creates a new Email entry linking together the original `email` with provided `derivedId` and `customId`. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-jLlJrXzt9Z7dhnTHGU9QP7LYN5dTVYw4PfJtWoWwOQ4zUm0gI5OFHRdX6lsJVUCPtUSfJ77ABxas6klOP6YX8A";
const email = "recipient@example.com";
const hmac = crypto.createHmac("sha512", "secret");
hmac.update(email);
const derivedId = hmac.digest("base64");
const customId = crypto.randomBytes(66).toString("base64");
media.createEmail(
    capability,
    {
        customId,
        derivedId,
        email
    },
    (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            customId: "Or_kyl1LSBWrsIfSqGtGgF7jSBy59DRZIhopeAo3lb0sD_0wGQ5knawVh5MBEMsK-q0u6kbYJu9lIVRSQ1Ob1Q",
            capabilities:
            {
                deleteEmail: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-q4d-NT14FGkcm4HzKD6Iay7I47ZZwbvuu-_W6C5LoDvR_4xIBh5vPWCIm8NYSAAaq0-MKuuI7_6vqn4cVWouwQ",
                sendEmail: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-p5oyZEcEkC0IKcB3Ilwu93TqN67GOgM6g96seAHd9QCePYJkp5_up_FMcuJh81TQfWxaJocqWFKcUi8B498cpg"
            }
        }
        */
    }
);
```

#### media.createEmailDomainIdentity(capability, config, callback)

  * `capability`: _Capability URI_ Capability to create EmailDomainIdentity.
  * `config`: _Object_ Configuration of the EmailDomainIdentity to create.
    * `domain`: _String_ Email domain to send emails from. For example `example.com`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `capabilities`: _Object_ EmailDomainIdentity capabilities.
      * `domain`: _String_ The `domain` provided when making this call.
      * `verificationToken`: _String_ A TXT record that you must place in the DNS settings of the domain to complete domain verification.

Creates a new EmailDomainIdentity from which you can send emails from. You will need to verify the provided `domain` by creating a TXT record with the returned `verificationToken` prior to being able to send out an email. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-jRUKYANXc8EJcPytU4e_dJVotyp0xz7fN5w8mZSV2rbyzlI8BM9VuQefbG4dux_zW6alk3kdcNPSRk1Jwv_uXA";
media.createEmailDomainIdentity(
    capability,
    {
        domain: "example.com"
    },
    (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            domain: "example.com,
            verificationToken: "vDw9W7S_meuM3qZ8ghyo1atklWn3x8jjh0z3Ql2",
            capabilities:
            {
                createEmail: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-NvwiPpjhBztvo51d_GS0LF2faPYuOrmG0KYR57wxQqSeGs6j_IPuwZRyWcA6gyHn5P8ORwEx_ZBIa8sgJyXk4g",
                deleteEmailDomainIdentity: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-AWMKeoWXvrRwF5nA5CF9gjxXSDGiE3sJxURc4WrCkqQ5FRAOxxkvCQiHe7Uw7SHpzw2ZfGu_sGCgwzTYd0ymTA",
                getEmailCustomId: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-ns3k6zubsBVJFRf_IYEE-2P0QJ-v0uud3Si_4EyKLX4Mr2_lPmQyVQDOJFFsDb5scXjo2hllaIuFjSw2NLglpA",
                getVerificationStatus: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-UW1aqMM_Nefge4lusQem-k1r5BamDqe87IpaY0WaJwW3-YE07Q7ZAB3rEs_RbLpVdJI7mpHnEvOtbDeAZbf8NQ"
            }
        }
        */
    }
);
```

#### media.deleteEmail(capability, callback)

  * `capability`: _Capability URI_ Capability to delete an email.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.

Deletes a single Email from EmailDomainIdentity. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-q4d-NT14FGkcm4HzKD6Iay7I47ZZwbvuu-_W6C5LoDvR_4xIBh5vPWCIm8NYSAAaq0-MKuuI7_6vqn4cVWouwQ";
media.deleteEmail(capability, (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            statusCode: 200,
            message: "OK"
        }
        */
    }
);
```

#### media.deleteEmailDomainIdentity(capability, callback)

  * `capability`: _Capability URI_ Capability to delete an EmailDomainIdentity.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.

Deletes an EmailDomainIdentity. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-AWMKeoWXvrRwF5nA5CF9gjxXSDGiE3sJxURc4WrCkqQ5FRAOxxkvCQiHe7Uw7SHpzw2ZfGu_sGCgwzTYd0ymTA";
media.deleteEmailDomainIdentity(capability, (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            statusCode: 200,
            message: "OK"
        }
        */
    }
);
```

#### media.deleteSelf(capability, callback)

  * `capability`: _Capability URI_ Capability to delete self.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.

Deletes Media Service tenant (your account within Media Service). This will delete all EmailDomainIdentities and Emails within Media Service. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-gUlAPd3v1ClAXSdTU0XMhWzYZZp2HnPgmLUj3lDlF6ztidHxzX3XhKyDlsxkC5O1AlYdWn--re3LPD0GZoqqNA";
media.deleteSelf(capability, (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            statusCode: 200,
            message: "OK"
        }
        */
    }
);
```

#### media.getEmailCustomId(capability, derivedId, callback)

  * `capability`: _Capability URI_ Capability to retrieve `customId`s for an EmailDomainIdentity.
  * `derivedId`: _String_ Unique identifier for the email address that is derived from the email address. For example, a hash or an HMAC where the email address is one of the inputs. `derivedId` must match the `derivedId` used when creating the email.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `customId`: _String_ `customId` corresponding to provided `derivedId`.

Retrieves `customId` corresponding to the provided `derivedId`.

Media Service recommends that you only store `customId` and corresponding capabilities (`deleteEmail`, `sendEmail`) in order to not be responsible for storing Personally Identifiable Information.

If you have an email (for example, from a login), you can generate a `derivedId` (in the same way when you created the Email) and use `getEmailCustomId` to retrieve `customId`. Once you have `customId`, you can retrieve corresponding capabilities from your stores.

Example use of `getEmailCustomId`:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-ns3k6zubsBVJFRf_IYEE-2P0QJ-v0uud3Si_4EyKLX4Mr2_lPmQyVQDOJFFsDb5scXjo2hllaIuFjSw2NLglpA";
const email = "recipient@example.com";
const hmac = crypto.createHmac("sha512", "secret");
hmac.update(email);
const derivedId = hmac.digest("base64");
media.getEmailCustomId(capability, derivedId, (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            customId: "YG6V8h5Kru9THW6y2bppV5VP1/9pVIzL6OCyCwHN8IF875FWxbsHPtw9MGHJdLUMT+6cyxNAvEEuEVmkLY3xjRKu"
        }
        */
    }
);
```

#### media.getVerificationStatus(capability, callback)

  * `capability`: _Capability URI_ Capability to retrieve EmailDomainIdentity verification status.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `domain`: _String_ The `domain` being verified.
      * `verificationStatus`: _String_ The verification status. One of `Pending`, `Success`, `Failed`, `TemporaryFailure`, `NotStarted`.
      * `verificationToken`: _String_ A TXT record that you must place in the DNS settings of the domain to complete domain verification.

Retrieves the verification status for an EmailDomainIdentity. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-UW1aqMM_Nefge4lusQem-k1r5BamDqe87IpaY0WaJwW3-YE07Q7ZAB3rEs_RbLpVdJI7mpHnEvOtbDeAZbf8NQ";
media.getVerificationStatus(capability, (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            domain: "example.com",
            verificationStatus: "Pending",
            verificationToken: "vDw9W7S_meuM3qZ8ghyo1atklWn3x8jjh0z3Ql2"
        }
        */
    }
);
```

#### media.queryEmailDomainIdentities(capability, query, callback)

  * `capability`: _Capability URI_ Capability to query EmailDomainIdentities.
  * `query`: _Object_ _(Default: {})_ Query to execute.
    * `domain`: _String_ _(Default: undefined)_ Domain to query.
    * `lastDomain`: _String_ _(Default: undefined)_ Last domain from previousquery, used to return more results if there are more results to retrieve.
    * `limit`: _Number_ _(Default: 1)_ Limit on the number of results. The number of results will be less than or equal to the `limit`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `domains`: _Array_ An array of EmailDomainIdentities ordered by `domain`.
      * `completed`: _Boolean_ `true` if no more results, `false` otherwise.

Queries for existing EmailDomainIdentities. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-FgHpVTQ3zheJCWlr7-unvvhQIkvTBZcSclW4D5ausbOHdMQwLHVRqGkwNgi3OaptplLA25koR_UZ3nAVyeRYIw";
media.queryEmailDomainIdentities(capability, undefined, (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            domains:
            [
                {
                    domain: "example.com",
                    capabilities:
                    {
                        createEmail: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-NvwiPpjhBztvo51d_GS0LF2faPYuOrmG0KYR57wxQqSeGs6j_IPuwZRyWcA6gyHn5P8ORwEx_ZBIa8sgJyXk4g",
                        deleteEmailDomainIdentity: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-AWMKeoWXvrRwF5nA5CF9gjxXSDGiE3sJxURc4WrCkqQ5FRAOxxkvCQiHe7Uw7SHpzw2ZfGu_sGCgwzTYd0ymTA",
                        getEmailCustomId: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-ns3k6zubsBVJFRf_IYEE-2P0QJ-v0uud3Si_4EyKLX4Mr2_lPmQyVQDOJFFsDb5scXjo2hllaIuFjSw2NLglpA",
                        getVerificationStatus: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-UW1aqMM_Nefge4lusQem-k1r5BamDqe87IpaY0WaJwW3-YE07Q7ZAB3rEs_RbLpVdJI7mpHnEvOtbDeAZbf8NQ"
                    }
                }
            ],
            completed: false
        }
        */
    }
);
```

#### media.sendEmail(capability, config, callback)

  * `capability`: _Capability URI_ Capability to send an email.
  * `config`: _Object_ Configuration of email to send.
    * `message`: _Object_ Message to be sent.
      * `body`: _Object_ The message body.
        * `html`: _Object_ The content of the message, in HTML format.
          * `charset`: _String_ _(Default: 7-bit ASCII)_ The character set of the content. For example: UTF-8, ISO-8859-1, Shift_JIS.
          * `data`: _String_ The actual text.
        * `text`: _Object_ The content of the message, in text format.
          * `charset`: _String_ _(Default: 7-bit ASCII)_ The character set of the content. For example: UTF-8, ISO-8859-1, Shift_JIS.
          * `data`: _String_ The actual text.
      * `subject`: _Object_ The subject of the message.
          * `charset`: _String_ _(Default: 7-bit ASCII)_ The character set of the content. For example: UTF-8, ISO-8859-1, Shift_JIS.
          * `data`: _String_ The actual text.
    * `replyToAddresses`: _Array_ _(Default: undefined)_ The reply-to email address(es) for the message. If the recipient replies to the message, each reply-to address will receive the reply.
    * `returnPath`: _String_ _(Default: undefined)_ The email address that bounces and complaints will be forwarded to when feedback forwarding is enabled. If the message cannot be delivered to the recipient, then an error message will be returned from the recipient's ISP; this message will then be forwarded to the email address specified by the `returnPath` parameter. The `returnPath` parameter is never overwritten. This email address must be from an EmailDomainIdentity domain that has been verified.
    * `source`: _String_ The email address that is sending the email. This email address must be from an EmailDomainIdentity domain that has been verified.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `messageId`: _String_ Unique identifier for the sent email.

Sends email to the recipient corresponding the the provided `capability`. For example:
```javascript
const capability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-p5oyZEcEkC0IKcB3Ilwu93TqN67GOgM6g96seAHd9QCePYJkp5_up_FMcuJh81TQfWxaJocqWFKcUi8B498cpg";
media.sendEmail(
    capability,
    {
        message:
        {
            body:
            {
                html:
                {
                    charset: "utf8",
                    data: "<h1>Welcome to our thing!</h1>"
                },
                text:
                {
                    charset: "utf8",
                    data: "Welcome to our thing!"
                }
            },
            subject:
            {
                data: "Hello"
            }
        },
        replyToAddresses: [ "noreply@example.com" ],
        returnPath: "bounces@example.com",
        source: "ourthing@example.com"
    },
    (error, resp) =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
        else
        {
            console.log(resp); // successful response
        }
        /*
        resp =
        {
            messageId: "000001271b15238a-fd3ae762-2563-11df-8cd4-6d4e828a9ae8-000000"
        }
        */
    }
);
```
