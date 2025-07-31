import { useEffect, useState } from "react";

export default function ShowForm({ formId }) {
  const [form, setForm] = useState(null);
  const [savedData, setSavedData] = useState({});
  const [responses, setResponses] = useState([]);
  const [newField, setNewField] = useState({ 
    label: "", 
    type: "text", 
    required: false,
    options: [],
    optionInput: '',
    rInput: '',
    cInput: ''
  });

  useEffect(() => {
    if (!formId) return;
    fetchForm();
  }, [formId]);

  const fetchForm = () => {
    fetch(`http://localhost:8000/api/get-form/${formId}`)
      .then(res => res.json())
      .then(data => {
        setForm(data.form);
        setResponses(data.response || []);
      })
      .catch(err => console.error("Error fetching form:", err));
  };
// onchange on form data
  const handleChange = (e, label, type, optionalValue = null) => {
    if (type === "file") {
      setSavedData(prev => ({ ...prev, [label]: e.target.files[0] }));
    } else if (type === "checkbox") {
      if (optionalValue !== null) {
        const checked = e.target.checked;
        setSavedData(prev => {
          const existing = Array.isArray(prev[label]) ? prev[label] : [];
          return {
            ...prev,
            [label]: checked 
              ? [...existing, optionalValue]
              : existing.filter(item => item !== optionalValue)
          };
        });
      } else {
        setSavedData(prev => ({ ...prev, [label]: e.target.checked }));
      }
    } else {
      setSavedData(prev => ({ ...prev, [label]: e.target.value }));
    }
  };
// form data submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('formName', form.formName);
    Object.entries(savedData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    try {
      await fetch(`http://localhost:8000/api/submit-response/${formId}`, {
        method: "POST",
        body: formData,
      });
      fetchForm();
      setSavedData({});
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
// add new fields
  const handleAddField = () => {
    if (!newField.label) return alert("Field name is required");

    fetch('http://localhost:8000/api/add-field', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId, ...newField })
    })
      .then(res => res.json())
      .then(({ data }) => {
        setForm(data);
        setNewField({ 
          label: "", 
          type: "text", 
          required: false,
          options: [],
          optionInput: '',
          rInput: '',
          cInput: ''
        });
      });
  };
// remove fields
  const handleDelete = async (label) => {
    const res = await fetch(`http://localhost:8000/api/deleteField/${formId}/${label}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      const updatedFields = { ...form.fields };
      delete updatedFields[label];
      setForm(prev => ({ ...prev, fields: updatedFields }));
    } else {
      alert("Error: " + data.error);
    }
  };

  if (!form) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="form-container">
      {/* Form Header */}
      <div className="form-header">
        <h1>{form.formName}</h1>
      </div>

      {/* Add New Field Section */}
      <div className="add-field-section">
        <h2>Add New Field</h2>
        <div className="field-inputs">
          <input
            type="text"
            placeholder="Field Label"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          />
          
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          >
            <option value="">Select Field Type</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="radio">Radio</option>
            <option value="checkbox">Checkbox</option>
            <option value="password">Password</option>
            <option value="file">File</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
          </select>

          {/* Options for select, radio, checkbox */}
          {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
            <div className="options-section">
              <div className="option-input">
                <input
                  type="text"
                  placeholder={`Add ${newField.type} option`}
                  value={
                    newField.type === 'select' ? newField.optionInput :
                    newField.type === 'radio' ? newField.rInput :
                    newField.cInput
                  }
                  onChange={(e) => {
                    if (newField.type === 'select') {
                      setNewField({...newField, optionInput: e.target.value});
                    } else if (newField.type === 'radio') {
                      setNewField({...newField, rInput: e.target.value});
                    } else {
                      setNewField({...newField, cInput: e.target.value});
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const inputValue = 
                      newField.type === 'select' ? newField.optionInput.trim() :
                      newField.type === 'radio' ? newField.rInput.trim() :
                      newField.cInput.trim();
                    
                    if (inputValue) {
                      setNewField({
                        ...newField,
                        options: [...newField.options, inputValue],
                        optionInput: '',
                        rInput: '',
                        cInput: ''
                      });
                    }
                  }}
                >
                  Add Option
                </button>
              </div>
              
              {newField.options.length > 0 && (
                <div className="options-list">
                  {newField.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <span>{option}</span>
                      <button
                        onClick={() => {
                          const updated = [...newField.options];
                          updated.splice(index, 1);
                          setNewField({...newField, options: updated});
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <label className="required-checkbox">
            <input
              type="checkbox"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
            />
            Required
          </label>
        </div>
        
        <button onClick={handleAddField} className="add-field-btn">
          Add Field
        </button>
      </div>

      {/* Dynamic Form */}
      <div className="dynamic-form-section">
        <h2>Fill the Form</h2>
        <form onSubmit={handleSubmit}>
          {Object.entries(form.fields || {}).map(([label, config], index) => (
            <div key={index} className="form-field">
              <label>{label}{config.required && <span className="required-star">*</span>}</label>
              
              {config.type === "textarea" ? (
                <textarea
                  value={savedData[label] || ""}
                  onChange={(e) => handleChange(e, label, config.type)}
                  rows={4}
                />
              ) : config.type === "radio" ? (
                <div className="radio-group">
                  {config.options.map((option) => (
                    <label key={option}>
                      <input
                        type="radio"
                        name={label}
                        value={option}
                        checked={savedData[label] === option}
                        onChange={(e) => handleChange(e, label, config.type)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : config.type === "checkbox" ? (
                <div className="checkbox-group">
                  {config.options.map((option) => (
                    <label key={option}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={savedData[label]?.includes?.(option) || false}
                        onChange={(e) => handleChange(e, label, config.type, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : config.type === "file" ? (
                <input
                  type="file"
                  onChange={(e) => handleChange(e, label, config.type)}
                />
              ) : config.type === "select" ? (
                <select
                  value={savedData[label] || ""}
                  onChange={(e) => handleChange(e, label, config.type)}
                >
                  <option value="">Select an option</option>
                  {(config.options || []).map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={config.type}
                  value={savedData[label] || ""}
                  onChange={(e) => handleChange(e, label, config.type)}
                />
              )}
              
              <button
                type="button"
                onClick={() => handleDelete(label)}
                className="delete-field-btn"
              >
                Delete Field
              </button>
            </div>
          ))}

          {form.fields && Object.keys(form.fields).length > 0 && (
            <button type="submit" className="submit-btn">
              Submit Response
            </button>
          )}
        </form>
      </div>

      {/* Submitted Responses */}
      <div className="responses-section">
        <h2>Submitted Responses</h2>
        {responses.length > 0 ? (
          <div className="responses-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {Object.keys(responses[0])
                    .filter(key => !["_id", "formId", "formName", "createdAt", "updatedAt", "__v"].includes(key))
                    .map((key, i) => (
                      <th key={i}>{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((entry, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    {Object.keys(entry)
                      .filter(key => !["_id", "formId", "formName", "createdAt", "updatedAt", "__v"].includes(key))
                      .map((key, i) => {
                        const value = entry[key];
                        const isImage = typeof value === "string" && /\.(jpg|jpeg|png|gif)$/i.test(value);

                        return (
                          <td key={i}>
                            {isImage ? (
                              <img
                                src={`http://localhost:8000${value.startsWith("/") ? value : "/" + value}`}
                                alt="uploaded"
                                className="uploaded-image"
                              />
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-responses">No responses submitted yet.</p>
        )}
      </div>
    </div>
  );
}