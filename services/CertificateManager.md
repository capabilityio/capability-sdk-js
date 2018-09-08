# Certificate Manager Service

Certificate Manager Service enables creation and management of X.509 certificates for Transport Layer Security encryption.

Certificate Manager Service can be constructed using the SDK as follows:
```javascript
const CapabilitySDK = require("capability-sdk");
const certMngr = new CapabilitySDK.CertificateManager();
```

Once an instance of the Certificate Manager Service is created, you can use it to make calls to the Certificate Manager Service.

* [certMngr.createDomain(createDomainCapability, config, callback)](#certmngrcreatedomaincreatedomaincapability-config-callback)
* [certMngr.deleteDomain(deleteDomainCapability, callback)](
#certmngrdeletedomaindeletedomaincapability-callback)
* [certMngr.deleteSelf(deleteSelfCapability, callback)](#certmngrdeleteselfdeleteselfcapability-callback)
* [certMngr.deliverCertificate(deliverCertificateCapability, callback)](
#certmngrdelivercertificatedelivercertificatecapability-callback)
* [certMngr.queryDomains(queryDomainsCapability, query, callback)](#certmngrquerydomainsquerydomainscapability-query-callback)
* [certMngr.updateDomain(updateDomainCapability, config, callback)](#certmngrupdatedomainupdatedomaincapability-config-callback)

#### certMngr.createDomain(createDomainCapability, config, callback)

  * `createDomainCapability`: _Capability URI_ Capability to create domains.
  * `config`: _Object_ Configuration of the domain certificate to create.
    * `domain`: _String_ Fully qualified domain name to issue certificate for.
    * `capabilities`: _Object_ Capabilities for the service to use.
      * `receiveCertificate`: _Capability URI_ Capability the Certificate Manager Service will use to deliver the created certificate.
      * `updateChallenge`: _Capability URI_ Capability the Certificate Manager Service will use to provide a challenge in order to verify domain name ownership.
    * `subject`: _Object_ Subject to use with the created certificate.
      * `country`: _String_ The two-letter ISO country code of the country where the organization is located.
      * `stateProvince`: _String_ The state or province where the organization is located.
      * `locality`: _String_ The location of the organization, usually a city.
      * `organization`: _String_ Usually the legal incorporated name of a company and should include any suffixes such as Ltd., Inc., or Corp.
      * `organizationalUnit`: _String_ e.g. HR, Finance, IT.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `domain`: _String_ Fully qualified domain name for the certificate.
      * `capabilities`: _Object_ Certificate capabilities.

Creates a new domain. Creating a domain initiates a workflow that, when completed, will result in issuance and delivery of the certificate for the domain. For example:
```javascript
const createCapability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-nCDhNbIikGxjOuQu_dO343ELbUAy1S7iTz4Nv4agpi7r71RxzaPjjTRfnkbbQoCusEmBz6N4P_9lCVFSsbVElw";
certMngr.createDomain(
    createCapability,
    {
        domain: "example.com",
        capabilities:
        {
            receiveCertificate: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-7lq3JyPQKLn0mEAb3HITnimc1MgAfZ1da3C6ynZ7ypttWiodyejxwrZAZEBeFG4RE8ubAX2ADah74vtdpEXofQ",
            updateChallenge: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-SOMr2SevnzYRhrXEHGwvJ8VwajrhsGQBYsVIXOCCNvCyUYFKlK5KeJSm6KmwsZUnXsW5_fsUaNcwl8ebZfzXNw"
        },
        subject:
        {
            country: "US",
            stateProvince: "TX",
            locality: "Austin",
            organization: "Capability LLC",
            organizationalUnit: "Certificate Manager Service"
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
        resp =
        {
            domain: "example.com",
            capabilities:
            {
                deleteDomain: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-8irkkgMRuAMPAJZXaKVt5-QuWQ5FN0cRaRyoWQEY7bQMrLtgpEFE1Q-2u_AgypzQ9st-rMExniKcA7Va51T-nQ",
                deliverCertificate: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-OCbHj6-Yxn5HfTUKwAxcOILZ_MknA1sjBuKcl3GnL8VZfKuf63a-ce-eerYDzQDLacKPVtAV9ey_ELguTkMLwQ",
                updateDomain: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-8mH2u18nDTIt6fDH_bGO8Zcc89rqppX5Bdi8qyqH_c1VvjmRRTSojlUT3YS4pLwQcd375cinrQoOEfx1UhV4zg"
            }
        }
        */
    }
);
```

#### certMngr.deleteDomain(deleteDomainCapability, callback)

  * `deleteDomainCapability`: _Capability URI_ Capability to delete a domain.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.

Deletes a domain. Deleting a domain results in deletion of the corresponding certificate from Certificate Manager Service, so that it will no longer be deliverable. However, the certificate itself will not be revoked with the Certificate Authority and will remain valid until its expiration date.

Example:
```javascript
const deleteDomainCapability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-8irkkgMRuAMPAJZXaKVt5-QuWQ5FN0cRaRyoWQEY7bQMrLtgpEFE1Q-2u_AgypzQ9st-rMExniKcA7Va51T-nQ";
certMngr.deleteDomain(deleteDomainCapability, (error, resp) =>
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

#### certMngr.deleteSelf(deleteSelfCapability, callback)

  * `deleteSelfCapability`: _Capability URI_ Capability to delete self.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.

Deletes Certificate Manager Service tenant (your account within Certificate Manager Service). This will delete all domains and certificates within Certificate Manager Service. The certificates themselves will not be revoked and will remain valid until their expirationd ate.

Example:
```javascript
const deleteSelfCapability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-nDVxOGSXGjtReivGPNuJ1qJQTCs0_BxD_2SLsfs9jfn5rGOKnAYrUQUHAorArSGVUw_JlvtVC9dd6f-yjuikgA";
certMngr.deleteSelf(deleteSelfCapability, (error, resp) =>
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
            statusCode: 202,
            message: "Accepted"
        }
        */
    }
);
```

#### certMngr.deliverCertificate(deliverCertificateCapability, callback)

  * `deliverCertificateCapability`: _Capability URI_ Capability to deliver certificate.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.

Delivers the certificate to the corresponding `receiveCertificate` capability. When this capability is invoked, the Certificate Manager Service will invoke the corresponding `receiveCertificate` capability provided on domain creation. The payload delivered via `receiveCertificate` capability is a JSON object with the following fields:

  * `certificate`: _String_ Certificate for the domain in PEM format.
  * `domain`: _String_ Domain the certificate is issued for.
  * `key`: _String_ Private key for the certificate in PEM format.

Example:
```javascript
const deliverCertificateCapability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-OCbHj6-Yxn5HfTUKwAxcOILZ_MknA1sjBuKcl3GnL8VZfKuf63a-ce-eerYDzQDLacKPVtAV9ey_ELguTkMLwQ";
certMngr.deliverCertificate(deliverCertificateCapability, (error, resp) =>
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

#### certMngr.queryDomains(queryDomainsCapability, query, callback)

  * `queryDomainsCapability`: _Capability URI_ Capability to query domains.
  * `query`: _Object_ _(Default: {})_ Query to execute.
    * `domain`: _String_ _(Default: undefined)_ Domain to query.
    * `lastDomain`: _String_ _(Default: undefined)_ Last domain from previous query, used to return more results if there are more results to retrieve.
    * `limit`: _Number_ _(Default: 1)_ Limit on the number of results. The number of results will be less than or equal to the `limit`.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response object.
      * `domains`: _Array_ An array of domains ordered by `domain`.
      * `completed`: _Boolean_ `true` if no more results, `false` otherwise.

Queries for existing domains. For example:
```javascript
const queryDomainsCapability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-1BLQjUnVrfbL6qIKQosgin69km7fnjtBX5m-A_sYesMgEuLs0_P0Yj-gi5dZ9O_P0GfPz6S_cbNhTkMzrb0g7w";
certMngr.queryDomains(queryDomainsCapability, undefined, (error, resp) =>
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
                    capabilities:
                    {
                        deleteDomain: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-8irkkgMRuAMPAJZXaKVt5-QuWQ5FN0cRaRyoWQEY7bQMrLtgpEFE1Q-2u_AgypzQ9st-rMExniKcA7Va51T-nQ",
                        deliverCertificate: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-OCbHj6-Yxn5HfTUKwAxcOILZ_MknA1sjBuKcl3GnL8VZfKuf63a-ce-eerYDzQDLacKPVtAV9ey_ELguTkMLwQ",
                        updateDomain: "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-8mH2u18nDTIt6fDH_bGO8Zcc89rqppX5Bdi8qyqH_c1VvjmRRTSojlUT3YS4pLwQcd375cinrQoOEfx1UhV4zg"
                    },
                    cert: "-----BEGIN CERTIFICATE-----\n..."
                    domain: "example.com",
                    expirationDate: "2019-09-07T17:03:02.838Z"
                    intermediateCerts: "-----BEGIN CERTIFICATE-----\n..."
                }
            ],
            completed: true
        }
        */
    }
);
```

#### certMngr.udpateDomain(updateDomainCapability, config, callback)

  * `updateDomainCapability`: _Capability URI_ Capability to update domain.
  * `config`: _Object_ Domain configuration to update.
    * `capabilities`: _Object_ Capabilities for the service to use.
      * `receiveCertificate`: _Capability URI_ Capability the Certificate Manager Service will use to deliver the created certificate.
      * `updateChallenge`: _Capability URI_ Capability the Certificate Manager Service will use to provide a challenge in order to verify domain name ownership.
  * `callback`: _Function_ `(error, response) => {}`
    * `error`: _Error_ Error, if any.
    * `response`: _Object_ Response.
      * `statusCode`: _Number_ HTTP status code.
      * `message`: _String_ HTTP reason phrase.

Updates capabilities to be used by Certificate Manager Service for the domain.

Example:
```javascript
const updateDomainCapability = "cpblty://membrane.amzn-us-east-1.capability.io/#CPBLTY1-8mH2u18nDTIt6fDH_bGO8Zcc89rqppX5Bdi8qyqH_c1VvjmRRTSojlUT3YS4pLwQcd375cinrQoOEfx1UhV4zg";
certMngr.updateDomain(updateDomainCapability, (error, resp) =>
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
