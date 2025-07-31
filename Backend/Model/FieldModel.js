const mongoose = require('mongoose');
const formSchema = new mongoose.Schema({
  formName: { type: String, required: true },
  fields: {
    type: Map,
    of: new mongoose.Schema({
      type: { type: String, required: true },
      required: { type: Boolean, default: false },
      options:[String]
    }),
    lowercase:true,
    default: {},
  }
}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);
module.exports = Form;
