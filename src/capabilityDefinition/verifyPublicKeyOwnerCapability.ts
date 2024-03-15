
import Joi from 'joi';
import CapabilityDefinition from './capabilityDefinition.js';

const VerifyPublicKeyOwnerCapability = new CapabilityDefinition({
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