
import Joi from 'joi';
import Capability from './capability.js';

const VerifyPublicKeyOwnerCapability = new Capability({
    title: 'bsvalias public key verify (Verify Public Key Owner)',
    responseBodyValidator: (body) => {
      const schema = Joi.object({
          bsvalias: Joi.string().optional().allow('1.0'),
          handle: Joi.string().required(),
          pubkey: Joi.string().required(),
          match: Joi.boolean().required()
      });
      const { error, value } = schema.validate(body);
      if (error) {
          throw new Error(`Validation error: ${error.message}`);
      }
      return value;
  },
});

export default VerifyPublicKeyOwnerCapability;