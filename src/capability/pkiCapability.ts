import Joi from 'joi';
import Capability from './capability.js';


  const PublicKeyInfrastructureCapability = new Capability({
    code: 'pki',
    title: 'Public Key Infrastructure',
    authors: ['andy (nChain)', 'Ryan X. Charles (Money Button)'],
    version: '1',
    responseBodyValidator: (body) => {
      const pubkeyRegex = /^(02|03)[a-fA-F0-9]{64}$/;
  
      const schema = Joi.object({
        bsvalias: Joi.string().valid('1.0').required(),
        handle: Joi.string().pattern(new RegExp('^[^@]+@[^.]+\\.[^.]+$')).required(),
        pubkey: Joi.string().pattern(pubkeyRegex).required()
      });
  
      const { error, value } = schema.validate(body);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }
      return value;
    },
  });

  export default PublicKeyInfrastructureCapability;