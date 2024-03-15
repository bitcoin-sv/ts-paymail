import Joi from 'joi';
import CapabilityDefinition from './capabilityDefinition.js';

const ReceiveTransactionCapability = new CapabilityDefinition({
    title: 'Receive Transaction',
    authors: ['Miguel Duarte (Money Button)', 'Ryan X. Charles (Money Button)', 'Ivan Mlinaric (Handcash)', 'Rafa (Handcash)'],
    version: '1.1',
    method: 'POST',
    responseBodyValidator: (body) => {
      const schema = Joi.object({
          txid: Joi.string().required(),
          note: Joi.string(),
      });
      const { error, value } = schema.validate(body);
      if (error) {
          throw new Error(`Validation error: ${error.message}`);
      }
      return value;
  },
});

export default ReceiveTransactionCapability;