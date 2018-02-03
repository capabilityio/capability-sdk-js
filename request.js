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

const CapabilitySdk = require("./index.js");
const CapabilityUri = require("capability-uri");
const concat = require("concat-stream");
const https = require("https");

/*
  * `capability`: _Capability URI_ Capability to use.
  * `options`: _Object_ HTTPS request options, if any. Hostname, port, and
      authorization header will be overriden by the specified `capability`.
  * `data`: _String_ Request data to send, if any.
  * `callback`: _Function_ `(error, resp) => {}`
    * `error`: _Error_ Error, if any.
    * `resp`: _Object_ Response object.
*/
module.exports = function(capability, options, data, callback)
{
    const req = CapabilitySdk.request(capability, options);
    req.on("response", resp =>
        {
            resp.pipe(concat({encoding: "string"}, response =>
                {
                    if (response.length > 0)
                    {
                        try
                        {
                            response = JSON.parse(response);
                        }
                        catch (e)
                        {
                            return callback(
                                {
                                    error: "Parsing response failed",
                                    statusCode: resp.statusCode,
                                    message: `error parsing "${response}"`
                                }
                            );
                        }
                    }
                    if (resp.statusCode >= 400)
                    {
                        return callback(
                            {
                                error: response.error,
                                statusCode: resp.statusCode,
                                message: response.message
                            }
                        );
                    }
                    return callback(null, response);
                }
            ));
        }
    );
    req.on("error", error =>
        {
            return callback(
                {
                    error: "Request failed",
                    message: `Request failed due to ${error}`,
                    details: error
                }
            );
        }
    );
    req.write(data || "");
    req.end();
};
