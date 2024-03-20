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