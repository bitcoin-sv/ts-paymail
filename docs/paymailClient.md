
Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

# Interfaces

## Overview
`PaymailClient` is a class in the ts-paymail library that provides methods to interact with Paymail services. It encapsulates the functionality required for discovering capabilities, sending requests, and handling responses in accordance with Paymail standards.

## Initialization
To use `PaymailClient`, first create an instance by passing optional dependencies like an `HttpClient`, `DNSResolverOptions`, and a `localhostPort`.


## Class: PaymailClient

```ts
export default class PaymailClient {
    constructor(httpClient?: HttpClient, dnsOptions?: DNSResolverOptions, localhostPort?: number) 
    public ensureCapabilityFor = async (aDomain, aCapability) => {
        const capabilities = await this.getDomainCapabilities(aDomain);
        if (!capabilities[aCapability]) {
            throw new Error(`Domain "${aDomain}" does not support capability "${aCapability}"`);
        }
        return capabilities[aCapability];
    };
    public request = async (aDomain: string, capability: Capability, body?: any) => {
        const [name, domain] = aDomain.split("@");
        const url = await this.ensureCapabilityFor(domain, capability.getCode());
        const requestUrl = url.replace("{alias}", name).replace("{domain.tld}", domain);
        const response = await this.httpClient.request(requestUrl, {
            method: capability.getMethod(),
            body,
        });
        const responseBody = await response.json();
        return capability.validateBody(responseBody);
    };
    public getPublicProfile = async (paymail) => {
        return this.request(paymail, PublicProfileCapability);
    };
}
```

## Methods

### `request`
Sends a request to a Paymail server based on the provided capability and handles the response.

To extend the paymail client to new capabilities you can leverage the request method to handle some of the boilerplate logic

- **Parameters:**
  - `aDomain`: The domain to send the request to.
  - `capability`: The `Capability` object representing the capability to use.
  - `body`: (Optional) The request body to send.

- **Returns:** The validated response body.

- **Usage:**
```ts
  const response = await paymailClient.request('satoshi@example.com', someCapability, requestBody);
```
