
import Joi from 'joi';
import CapabilityDefinition from './capabilityDefinition.js';


const P2pPaymentDestinationCapability = new CapabilityDefinition({
    title: 'Get no monitored payment destination (p2p payment destination)',
    authors: ['Miguel Duarte (Money Button)', 'Ryan X. Charles (Money Button)', 'Ivan Mlinaric (Handcash)', 'Rafa (Handcash)'],
    version: '1.1',
    method: 'POST',
    responseBodyValidator: (body) => {
      const schema = Joi.object({
        outputs: Joi.array().items(
          Joi.object({
            script: Joi.string().required(),
            satoshis: Joi.number().required()
        }) .required().min(1)),
        reference: Joi.string().required(),
      });
      const { error, value } = schema.validate(body);
      if (error) {
          throw new Error(`Validation error: ${error.message}`);
      }
      return value;
  },
});

export default P2pPaymentDestinationCapability;
