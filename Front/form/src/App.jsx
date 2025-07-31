import { useState, useEffect } from "react";
import ShowForm from "./pages/ShowFrom";
import "./App.css";

function App() {
  const [fields, setFields] = useState({ 
    type: "", 
    label: "", 
    required: false,
    options: [],
    optionInput: '',
    rInput: '',
    cInput: '' 
  });
  const [formName, setFormName] = useState("");
  const [formId, setFormId] = useState(null);
  const [allForms, setAllForms] = useState([]);
  const [selectForm, setSelectForm] = useState(null);
// show All Form 
  useEffect(() => {
    fetch("http://localhost:8000/api/allForms")
      .then(res => res.json())
      .then(data => setAllForms(data.data || []));
  }, []);
// Form-create
  const createForm = () => {
    if (!formName.trim()) return alert("Enter form name");
    fetch("http://localhost:8000/api/create-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formName })
    })
      .then(res => res.json())
      .then(data => {
        setAllForms(prev => [...prev, data.data]);
        setFormId(data.data._id);
        setFormName("");
      });
  };
// Field-Add
  const handleAddField = () => {
    if (!formId) return alert("Create form first");
    fetch("http://localhost:8000/api/add-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formId: formId,
        label: fields.label,
        type: fields.type,
        required: fields.required,
        options: fields.options
      })
    })
      .then(res => res.json())
      .then(() => setFields({ 
        label: "", 
        type: "", 
        required: false,
        options: [],
        optionInput: '',
        rInput: '',
        cInput: '' 
      }));
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="form-section">
          <h2>Create Dynamic Form</h2>
          {/* form-create input */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Form Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="form-input"
            />
            <button 
              onClick={createForm}
              className="btn btn-primary"
            >
              Create Form
            </button>
          </div>
        </div>
{/* Add field form */}
        {formId && (
          <div className="form-section">
            <h3>Add Fields</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Label"
                value={fields.label}
                onChange={(e) => setFields({ ...fields, label: e.target.value })}
                className="form-input"
              />
              <select
                value={fields.type}
                onChange={(e) => setFields({ ...fields, type: e.target.value })}
                className="form-select"
              >
                <option value="">Select Field Type</option>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="radio">Radio</option>
                <option value="checkbox">CheckBox</option>
                <option value="password">Password</option>
                <option value="file">File</option>  
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
              </select>
            </div>

            {(fields.type === 'select' || fields.type === 'radio' || fields.type === 'checkbox') && (
              <div className="options-section">
                <div className="option-input-group">
                  <input 
                    type="text" 
                    placeholder={`Add ${fields.type} option`}
                    value={
                      fields.type === 'select' ? fields.optionInput : 
                      fields.type === 'radio' ? fields.rInput : 
                      fields.cInput
                    }
                    onChange={(e) => 
                      fields.type === 'select' ? setFields({...fields, optionInput: e.target.value}) :
                      fields.type === 'radio' ? setFields({...fields, rInput: e.target.value}) :
                      setFields({...fields, cInput: e.target.value})
                    }
                    className="form-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const inputValue = 
                        fields.type === 'select' ? fields.optionInput.trim() :
                        fields.type === 'radio' ? fields.rInput.trim() :
                        fields.cInput.trim();
                      
                      if (inputValue !== "") {
                        setFields({
                          ...fields, 
                          options: [...fields.options, inputValue],
                          optionInput: '',
                          rInput: '',
                          cInput: ''
                        });
                      }
                    }}
                    className="btn btn-sm btn-add"
                  >
                    +
                  </button>
                </div>

                {fields.options.length > 0 && (
                  <div className="options-list">
                    {fields.options.map((v, i) => (
                      <span key={i} className="option-tag">
                        {v}
                        <button 
                          onClick={() => {
                            const updated = [...fields.options];
                            updated.splice(i, 1);
                            setFields({...fields, options: updated});
                          }}
                          className="btn-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={fields.required}
                  onChange={(e) => setFields({ ...fields, required: e.target.checked })}
                  className="checkbox-input"
                /> 
                <span>Required</span>
              </label>
            </div>

            <button 
              onClick={handleAddField}
              className="btn btn-primary"
            >
              Add Field
            </button>
          </div>
        )}
{/* show all form */}
        <div className="form-section">
          <h3>All Forms</h3>
          <div className="forms-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allForms.map((f, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{f.formName}</td>
                    <td>
                      <button 
                        onClick={() => setSelectForm(f._id)}
                        className="btn btn-sm btn-view"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
{/* connect showForm Page */}
      <div className="preview-panel">
        {selectForm && (
          <div className="form-preview">
            <h3>Form Preview</h3>
            <ShowForm formId={selectForm} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;