  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const db=require('./Config/db');
  const FormResponse = require('./Model/FormResponse');
  const Form = require('./Model/FieldModel');
  const path=require("path")
  const app = express();
  const port = 8000;
const multer=require("multer");


const storage=multer.diskStorage({
     destination:(req,file,cb)=>{
          cb(null,'Uploads/')
     },
     filename:(req,file,cb)=>{
          const uniqueName=Date.now()+'-'+file.originalname;
          cb(null,uniqueName)
     }
})
const uploads=multer({storage:storage})

  app.use(cors());
  app.use(bodyParser.json());
  app.use('/Uploads',express.static(path.join(__dirname,'Uploads')))
  //  Create new form
  app.post("/api/create-form", async (req, res) => {
    try {
      const { formName } = req.body;
      const newForm = new Form({ formName, fields: {} });
      await newForm.save();
      return res.status(200).json({ msg: "Form created successfully", data: newForm });
    } catch (err) {
      return res.status(500).json({ msg: "Error creating form", error: err.message });
    }
  });
  // Add a field to form
  app.post("/api/add-field", async (req, res) => {
    const { formId, label, type, required,options } = req.body;
    try {
      const form = await Form.findById(formId);
      const newfield={label:label.toLowerCase(),type,required}
      if((type==='select'|| type==='radio' || type==='checkbox') && Array.isArray(options)){
        newfield.options=options
      }
      // form.fields.set(label.toLowerCase(),
      //                   {label:label.toLowerCase(),
      //                     type,required,options})
console.log("newField:-",newfield)
      form.fields.set(label.toLowerCase(),newfield)
      console.log("Form:-",form)
      await form.save()
      if (!form) return res.status(404).json({ msg: "Form not found",data:err });
      return res.status(200).json({ msg: "Field added successfully", data: form });
    } catch (err) {
      return res.status(500).json({ msg: "Error adding field", error: err.message });
    }
  });
  // Get single form
  app.get("/api/get-form/:id", async (req, res) => {
    try {
      const form = await Form.findById(req.params.id);
      if (!form) return res.status(404).json({ msg: "Form not found" });
      const response=await FormResponse.find({formId:form._id})
      return res.json({form,response});
    } catch (err) {
      return res.status(500).json({ msg: "Error fetching form", error: err.message });
    }
  });
  //  Get all forms
  app.get("/api/allForms", async (req, res) => {
    try {
      const allForms = await Form.find();
      return res.status(200).json({ msg: 'All forms', data: allForms });
    } catch (err) {
      return res.status(500).json({ msg: "Error fetching forms", error: err.message });
    }
  });
  //  Add response data
  app.post("/api/addData", async (req, res) => {
    try {
      const { formId, responses } = req.body;
      //$push=>mongodb ma aaray field insert karti he
      const updatedForm = await Form.findByIdAndUpdate(
        formId,
        { $push: { data: responses } },
        { new: true }
      );
      return res.status(200).json({ msg: 'Data added successfully', data: updatedForm });
    } catch (err) {
      return res.status(500).json({ msg: "Error adding data", error: err.message });
    }
  });
  // Add-Data
  app.post('/api/submit-response/:formId',uploads.any(), async (req, res) => {
    try {
      const form = await Form.findById(req.params.formId);
      let fileData={};
      if(req.files && req.files.length>0){
        req.files.forEach((file)=>{fileData[file.fieldname]=`/uploads/${file.filename}`})
      }
      const fields = req.body;
  for(let key in fields){
    if(typeof fields[key]==='string'){
      fields[key]=fields[key].toLowerCase()
    }
  }
      const newResponse = new FormResponse({
        formId: form._id,
        formName: String(form.formName),...fields,...fileData
      });
      console.log(newResponse)
      await newResponse.save();
      await form.save()
      res.status(201).send("Response saved");
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).send("Server error");
    }
  });
  // Delete-fields
  app.delete("/api/deleteField/:formId/:label", async (req, res) => {
    try {
      const { formId, label } = req.params;
      //$unset=>mongodb mathi koy field ne remove karva
    const updateOne=await Form.findByIdAndUpdate(formId,{$unset:{[`fields.${label}`]:true}},{new:true})
      return res.status(200).json({ success: true, msg: "Field deleted successfully", data: updateOne });
    } catch (err) {
      console.error("Error deleting field:", err);
      return res.status(500).json({ success: false, error: "Something went wrong" });
    }
  });

  app.listen(port, () => {
    console.log("Server running on port " + port);
  });
