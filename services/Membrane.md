# Membrane Service

Membrane Service enables creation and management of capabilities.

Membrane Service can be constructed using the SDK as follows:
```javascript
const CapabilitySdk = require("capability-sdk");
const membrane = new CapabilitySdk.Membrane();
```

Once an instance of the Membrane Service is created, you can use it to make calls to the Membrane Service.

* [membrane.create(createCapability, membrane, callback)](#membranecreatecreatecapability-membrane-callback)
* [membrane.deleteSelf(deleteSelfCapability, callback)](#membranedeleteselfdeleteselfcapability-callback)
* [membrane.export(exportCapability, config, callback)](#membraneexportexportcapability-config-callback)
* [membrane.query(queryCapability, query, callback)](#membranequeryquerycapability-query-callback)
* [membrane.revoke(revokeCapability, callback)](#membranerevokerevokecapability-callback)

#### membrane.create(createCapability, membrane, callback)

  * `createCapability`: _Capability URI_ Capability to create membranes.
  * `membrane`: _Object_ Membrane to create.
    * `id`: _String_ Unique id to assign to the membrane.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `id`: _String_ Membrane id.
      * `capabilities`: _Object_ Membrane capabilities.

Creates a new membrane. For example:
```javascript
const createCapability = `cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-CZ9zvxISLdPVIiEPdyO6P67yxBOrhTv3FiLji5Qcou3K6hCHchXy-AZMVpGkEA5-9avUoraS-8VjClQuxZnzFQ`;
membrane.create(createCapability, {id: "my-first-membrane"}, (error, resp) =>
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
        response =
        {
            id: "my-first-membrane",
            capabilities:
            {
                export: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-E0dTSQY_Tq01tZtMAfQANR97S3jB8QXrDDv5dylF9-PM-MphtPmjWtTYmmiSHfuS3t0aXYVB0EM42JuLSsLLLA"
                revoke: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-1lCiUqEOUpQwe6XKWM8unsu4667NyS7kNYSIKCw6pEm2-zRnwDmdoJkarbN81_Bo_cwWnfuXR4_2LhvInpNCYw"
            }
        }
        */
    }
);
```

#### membrane.deleteSelf(deleteSelfCapability, callback)

  * `deleteSelfCapability`: _Capability URI_ Capability to delete self.
  * `callback`: _Function_ `(error) => {}`
    * `error`: _Error_ Error, if any.

Deletes Membrane Service tenant (your account within Membrane Service). This will delete all membranes and capabilities, and revoke all tenant capabilities within Membrane Service.

Example:
```javascript
const deleteSelfCapability = `cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-OtWGOZF3FxlyVAh4chXhfy911Fcfa4N66hkMM-AF6cNEzc8AQYwhVYw0Bw13GDQOnGHVHF1_Ir90mr34zdH9Bg`;
membrane.deleteSelf(deleteSelfCapability, error =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
    }
);
```

#### membrane.export(exportCapability, config, callback)

  * `exportCapability`: _Capability URI_ Capability to export capability through membrane.
  * `config`: _Object_ Configuration of the capability to export through membrane.
    * `capability`: _Capability URI_ **Mutually exclusive with `uri`.** An already existing capability to re-export through this membrane. If this membrane is revoked, the original capability will not be revoked. Only the capability created during this re-export and any of its descendants will be revoked.
    * `uri`: _String_ **Mutually exclusive with `capability`.** Fully qualified URI, for example https://example.com/path/to/something
    * `allowQuery` (`uri` option): _Boolean_ _(Default: false)_ Optionally allow requester's URI query string to be appended to the `uri` in membrane request.
    * `headers` (`uri` option): _Object_ _(Default: undefined)_ Optional headers to include with the membrane request to the URI. Hop-by-hop headers will be ignored.
    * `hmac` (`uri` option): _Object_ _(Default: undefined)_ Optional selector for which signature scheme to use to sign membrane request to URI.
      * `cap1-hmac-sha512`: _Object_ Use CAP1-HMAC-SHA512 signature.
        * `key`: _String_ Base64url encoded secret key bytes.
        * `keyId`: _String_ Secret key id.
    * `method` (`uri` option): _String_ _(Default: undefined)_ Optional HTTP method to use in the membrane request to the URI. This overrides the method specified by the requester.
    * `timeoutMs` (`uri` option): _Number_ _(Default: undefined)_ Optional timeout in milliseconds to end idle connection between membrane and URI. Will be ignored if greater than membrane's configured internal timeout.
    * `tls` (`uri` option): _Object_ _(Default: undefined)_ TLS options.
      * `ca`: _String_ _(Default: undefined)_ Optionally, override default trusted Certificate Authorities (CAs). Default is to trust the well-known CAs curated by Mozilla. Mozilla's CAs are completely replaced when CA is explicitly specified using this option.
      * `cert`: _String_ _(Default: undefined)_ Optional certificate chain in PEM format.
      * `key`: _String_ _(Default: undefined)_ Optional private key in PEM format.
      * `rejectUnauthorized`: _Boolean_ _(Default: true)_ If not `false`, membrane request verifies responding server against the list of supplied Certificate Authorities.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `capability`: _Capability URI_ Created capability.

Exports a capability through the membrane per specified configuration. For example:
```javascript
const exportCapability = `cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-E0dTSQY_Tq01tZtMAfQANR97S3jB8QXrDDv5dylF9-PM-MphtPmjWtTYmmiSHfuS3t0aXYVB0EM42JuLSsLLLA`;
membrane.export(exportCapability,
    {
        uri: "https://example.com",
        allowQuery: true,
        method: "get",
        headers:
        {
            "X-My-Header": "My_Header_Here"
        }
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
        response =
        {
            capability: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-AQBJT_0r4O1Um6Xhe5F3T228Y_Tza2REq8etjMcRhQHemamQuVX4kIRdZHwhVa75SrPFri8Go_80BWmWM9xuHA"
        }
        */
    }
);
```

Alternatively, re-exports an already existing capability through the membrane. For example:
```javascript
const exportCapability = `cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-E0dTSQY_Tq01tZtMAfQANR97S3jB8QXrDDv5dylF9-PM-MphtPmjWtTYmmiSHfuS3t0aXYVB0EM42JuLSsLLLA`;
membrane.export(exportCapability,
    {
        capability: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-LI1kp6Wwf0WxkAL3x6E5Zmoy3ktmLd5oit9BnDIGTsx2OqkVoCTwfO9SvS9loWaV7HLwc6lXi4CNq7Hzjpajow"
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
        response =
        {
            capability: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-o0JX1SclvWshklZlxyPeX8Z3kgwlKpqBOMvoolbg-wKeUVwNz6VD-2kETJz5pTZRW8krzEXEYdmzvWYH06fDFA"
        }
        */
    }
);
```

#### membrane.query(queryCapability, query, callback)

  * `queryCapability`: _Capability URI_ Capability to query membranes.
  * `query`: _Object_ _(Default: {})_ Query to execute.
    * `id`: _String_ _(Default: undefined)_ Id of the membrane to query.
    * `lastId`: _String_ _(Default: undefined)_ Id of the last membrane from previous query, used to return more results if there are more results to retrieve.
    * `limit`: _Number_ _(Default: 1)_ Limit on the number of results. The number of results will be less than or equal to the `limit`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `membranes`: _Array_ An array of membranes ordered by 'id'. Each result contains `id` and `capabilities` corresponding to the membrane.
      * `completed`: _Boolean_ `true` if no more results, `false` otherwise.

Queries for existing membranes. For example:
```javascript
const queryCapability = `cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-egK2BKhEO9cNISYbfw0Kngpd-7jXp6eqJC98rxaOlDME0Sa6HWfJu5FzbITemg7GNlZY5-e6DW-DbElrs9IcvQ`;
membrane.query(queryCapability, null, (error, resp) =>
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
        response =
        {
            membranes:
            [
                {
                    id: "my-first-membrane",
                    capabilities:
                    {
                        export: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-E0dTSQY_Tq01tZtMAfQANR97S3jB8QXrDDv5dylF9-PM-MphtPmjWtTYmmiSHfuS3t0aXYVB0EM42JuLSsLLLA"
                        revoke: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-1lCiUqEOUpQwe6XKWM8unsu4667NyS7kNYSIKCw6pEm2-zRnwDmdoJkarbN81_Bo_cwWnfuXR4_2LhvInpNCYw"
                    }
                }
            ],
            completed: true
        }
        */
    }
);
```

#### membrane.revoke(revokeCapability, callback)

  * `revokeCapability`: _Capability URI_ Capability to revoke a membrane.
  * `callback`: _Function_ `(error) => {}`
    * `error`: _Error_ Error, if any.

Revokes membrane. Revoking will delete all of the capabilities that were previously exported through the membrane. This call is asynchronous. This means that when the response is returned, the process of revoking the membrane may not yet be complete. It is safe to call revoke multiple times (for example, in case of an error response).

Example:
```javascript
const revokeCapability = `cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-1lCiUqEOUpQwe6XKWM8unsu4667NyS7kNYSIKCw6pEm2-zRnwDmdoJkarbN81_Bo_cwWnfuXR4_2LhvInpNCYw`;
membrane.revoke(revokeCapability, error =>
    {
        if (error)
        {
            console.log(error, error.stack); // an error occurred
        }
    }
);
```
