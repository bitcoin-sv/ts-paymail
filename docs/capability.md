
# Capability 
A base definition for any new capability, contains information regarding the bfrc, HTTP Method, and methods for validation response body. Paymail Routes and Paymail Client take a base definition to extend the capabilities

A handful of base capabilities have been implemented and it is easy to create any new additional capability. 

## Class: Capability

```ts
export default class Capability {
    constructor({ code, title, authors, version, supersedes, responseBodyValidator, method }: {
        code?: string;
        title: string;
        authors?: string[];
        version?: string;
        supersedes?: string[];
        method?: "GET" | "POST";
        responseBodyValidator?: (body: any) => any;
    }) 
    public getCode(): string 
    public getMethod(): "GET" | "POST" 
    public validateBody(body: any): any 
}
```


### Example

#### Public Profile Implementation

```ts
import Joi from 'joi';
import Capability from './capability.js';


export default new Capability({
    title: 'Public Profile (Name & Avatar)',
    authors: ['Ryan X. Charles (Money Button)'],
    version: '1',
    responseBodyValidator: (body) => {
      const schema = Joi.object({
        name: Joi.string().required(),
        avatar: Joi.string().uri().required()
      });
  
      const { error, value } = schema.validate(body);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }
      return value;
    },
});

```