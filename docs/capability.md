
Links: [API](#api), [Classes](#classes)

# Classes

## Class: Capability

Represents a capability in the BSV Paymail protocol.
A capability is essentially a feature or service offered by a Paymail provider.

```ts
export default class Capability {
    constructor({ code, title, authors, version, supersedes, method }: {
        code?: string;
        title: string;
        authors?: string[];
        version?: string;
        supersedes?: string[];
        method?: "GET" | "POST";
    }) 
    public getCode(): string 
    public getMethod(): "GET" | "POST" 
}
```

<details>

<summary>Class Capability Details</summary>

### Constructor

Constructs a new Capability instance.

```ts
constructor({ code, title, authors, version, supersedes, method }: {
    code?: string;
    title: string;
    authors?: string[];
    version?: string;
    supersedes?: string[];
    method?: "GET" | "POST";
}) 
```

Argument Details

+ **params**
  + The parameters for the capability.

### Method getCode

Retrieves the code of the capability.

```ts
public getCode(): string 
```

Returns

The capability code or a generated code if not explicitly set.

### Method getMethod

Retrieves the HTTP method of the capability.

```ts
public getMethod(): "GET" | "POST" 
```

Returns

The HTTP method ('GET' or 'POST').

</details>

Links: [API](#api), [Classes](#classes)

---
