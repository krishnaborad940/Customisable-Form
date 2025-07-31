const mongoose=require('mongoose');


const responseSchema=mongoose.Schema({
     formId:{
        type:mongoose.Schema.Types.ObjectId,
        required:false,
        ref:'Form'
    },
     formName: { type: String, required: true },
},{strict:false,timestamps:true})


const FormResponse=mongoose.model("FormResponse",responseSchema);
module.exports=FormResponse  