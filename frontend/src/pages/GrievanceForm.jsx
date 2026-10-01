import React, { useState, useEffect } from 'react';
import { submitGrievance } from '../services/api';

const COMMITTEE = [
  { name: 'Dr.K.Kalidasa Murugavel', dept: 'Principal', post: 'Chairperson' },
  { name: 'Dr. G.S.R.Emil Selvan', dept: 'Thiagarajar College of Engineering, Madurai', post: 'Affiliating University Member' },
  { name: 'Dr.M.A.Neelakantan', dept: 'Sr.Dean(R&D), Prof & Head/S&H', post: 'Senior Faculty' },
  { name: 'Dr.B.Paramasivan', dept: 'Dean(SA&IR), Prof/AI&DS', post: 'Senior Faculty' },
  { name: 'Dr.S.Iyahraja', dept: 'Prof & Head/Mech', post: 'Senior Faculty' },
  { name: 'Dr.S.Tamil Selvi', dept: 'Prof & Head/ECE', post: 'Senior Faculty' },
  { name: 'Dr.V.Gomathi', dept: 'Prof & Head/CSE', post: 'Senior Faculty' },
  { name: 'Dr.M.Willjuicelruthayarajan', dept: 'Prof & Head/EEE', post: 'Senior Faculty' },
  { name: 'Dr.K.G.Srinivasagan', dept: 'Prof & Head/IT', post: 'Senior Faculty' },
  { name: 'Dr.I.Padmanaban', dept: 'Prof & Head/Civil', post: 'Senior Faculty' },
  { name: 'Dr.V.Kalaivani', dept: 'Prof & Head/AI&DS', post: 'Senior Faculty' },
];

// Alumni completed years starting from 1998 up to 2026
const ALUMNI_COMPLETED_YEARS = Array.from(
  { length: 2026 - 1998 + 1 },
  (_, i) => String(1998 + i)
);

const DYNAMIC_CONFIG = {
  Student: {
    top: [
      { id: 'regNo', label: 'Reg.No', type: 'text' },
      { id: 'rollNo', label: 'Roll No', type: 'text' },
    ],
    bottom: [
      { id: 'year', label: 'Year', type: 'select', options: ['I', 'II', 'III', 'IV'] },
      { id: 'degree', label: 'Degree', type: 'select', options: ['B.E', 'B.Tech', 'M.E', 'M.Tech', 'M.C.A'] },
      { id: 'course', label: 'Course', type: 'select', options: ['CSE', 'ECE', 'EEE', 'Mech', 'Civil', 'IT', 'AI&DS'] },
    ],
    showDepartment: false,
  },
  Staff: {
    top: [{ id: 'erpId', label: 'ERP ID', type: 'text' }],
    bottom: [],
    showDepartment: true,
  },
  Faculty: {
    top: [],
    bottom: [],
    showDepartment: true,
  },
  Parent: {
    top: [],
    bottom: [],
    showDepartment: false,
  },
  Alumni: {
    top: [
      { id: 'occupation', label: 'Occupation', type: 'text' },
      { id: 'place', label: 'Place', type: 'text' },
    ],
    bottom: [
      { id: 'completedYear', label: 'Completed Year', type: 'select', options: ALUMNI_COMPLETED_YEARS },
      { id: 'degree', label: 'Degree', type: 'select', options: ['B.E', 'B.Tech', 'M.E', 'M.Tech', 'M.C.A'] },
      { id: 'course', label: 'Course', type: 'select', options: ['CSE', 'ECE', 'EEE', 'Mech', 'Civil', 'IT', 'AI&DS'] },
    ],
    showDepartment: false,
  },
  Other: {
    top: [],
    bottom: [],
    showDepartment: false,
  },
};

export default function GrievanceForm() {
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Form State
  const [userType, setUserType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('');
  const [extraFields, setExtraFields] = useState({});

  const [description, setDescription] = useState('');
  const [wantUpload, setWantUpload] = useState('No');
  const [selectedFile, setSelectedFile] = useState(null);
  const [declared, setDeclared] = useState(false);

  // Status & UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    setCurrentDateStr('Date: ' + new Date().toLocaleString());
  }, []);

  // When userType changes, reset dynamic fields appropriately
  const handleUserTypeChange = (e) => {
    const newType = e.target.value;
    setUserType(newType);
    setExtraFields({});
    if (newType !== 'Staff' && newType !== 'Faculty') {
      setDepartment('');
    }
  };

  const handleExtraFieldChange = (id, value) => {
    setExtraFields((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Word count calculation
  const words = description.trim().length > 0 ? description.trim().split(/\s+/).length : 0;
  const isWordCountOver = words > 150;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['.docx', '.pdf', '.jpeg', '.jpg'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        setErrorMessage('Only .docx, .pdf, .jpeg files are allowed.');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be 10MB or less.');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }

      setErrorMessage('');
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessData(null);

    // Validations
    if (!userType) {
      setErrorMessage('Please choose a user type.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMessage('Please enter your mobile number.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please describe your grievance.');
      return;
    }
    if (isWordCountOver) {
      setErrorMessage('Grievance description must be under 150 words.');
      return;
    }
    if (wantUpload === 'Yes' && !selectedFile) {
      setErrorMessage('Please choose a file to upload, or switch upload to No.');
      return;
    }
    if (!declared) {
      setErrorMessage('Please accept the declaration before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('userType', userType);
      fd.append('name', name.trim());
      fd.append('email', email.trim());
      fd.append('gender', gender);
      fd.append('mobile', mobile.trim());
      fd.append('department', department);
      fd.append('description', description.trim());
      fd.append('wantUpload', wantUpload);

      // Append dynamic extra fields
      Object.entries(extraFields).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          fd.append(k, v);
        }
      });

      if (wantUpload === 'Yes' && selectedFile) {
        fd.append('document', selectedFile);
      }

      const result = await submitGrievance(fd);
      setSuccessData(result);

      // Reset form on success
      setUserType('');
      setName('');
      setEmail('');
      setGender('');
      setMobile('');
      setDepartment('');
      setExtraFields({});
      setDescription('');
      setWantUpload('No');
      setSelectedFile(null);
      setDeclared(false);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeConfig = DYNAMIC_CONFIG[userType] || { top: [], bottom: [], showDepartment: false };

  return (
    <>
      <div className="hero">
        <h2>Grievance Redressal Portal</h2>
        <p>
          Submit your grievance with correct contact details. A unique file identification
          number (GID) will be assigned, and confirmation will be emailed to you and to the
          committee automatically.
        </p>
      </div>

      <main className="form-main">
        <form onSubmit={handleSubmit} id="grievanceForm">
          {/* Panel 1: Personal Details */}
          <div className="panel">
            <div className="panel-head">
              <span>Grievance Redressal Portal</span>
              <span className="meta">
                <span>{currentDateStr}</span>
              </span>
            </div>
            <div className="panel-body">
              <div className="section-title">
                <span className="step-badge">1</span> Personal Details
              </div>

              <div className="grid" style={{ marginBottom: 16 }}>
                <div className="field">
                  <label htmlFor="userType">
                    User Type <span className="req">*</span>
                  </label>
                  <select
                    id="userType"
                    value={userType}
                    onChange={handleUserTypeChange}
                    required
                  >
                    <option value="">Choose Type</option>
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Parent">Parent</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="name">
                    Name with Initial (in BLOCK letters) <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="e.g. R.KUMAR"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Top Fields (e.g. regNo, rollNo, erpId, occupation) */}
              {activeConfig.top.length > 0 && (
                <div className="grid three" style={{ marginBottom: 16 }}>
                  {activeConfig.top.map((f) => (
                    <div className="field" key={f.id}>
                      <label htmlFor={f.id}>{f.label}</label>
                      <input
                        type="text"
                        id={f.id}
                        className="dyn-field"
                        placeholder={f.label}
                        value={extraFields[f.id] || ''}
                        onChange={(e) => handleExtraFieldChange(f.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Grid */}
              <div className="grid three">
                <div className="field">
                  <label htmlFor="email">
                    Email <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="mobile">
                    Mobile <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    placeholder="10-digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Bottom Fields (e.g. year, degree, course, completedYear) */}
              {activeConfig.bottom.length > 0 && (
                <div className="grid three" style={{ marginTop: 16 }}>
                  {activeConfig.bottom.map((f) => (
                    <div className="field" key={f.id}>
                      <label htmlFor={f.id}>{f.label}</label>
                      <select
                        id={f.id}
                        className="dyn-field"
                        value={extraFields[f.id] || ''}
                        onChange={(e) => handleExtraFieldChange(f.id, e.target.value)}
                      >
                        <option value="">-- SELECT --</option>
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Department selection for Staff / Faculty */}
              {activeConfig.showDepartment && (
                <div className="grid" style={{ marginTop: 16 }}>
                  <div className="field">
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="">-- SELECT --</option>
                      <option value="S&H">S&H</option>
                      <option value="AI&DS">AI&DS</option>
                      <option value="Mech">Mech</option>
                      <option value="ECE">ECE</option>
                      <option value="CSE">CSE</option>
                      <option value="EEE">EEE</option>
                      <option value="IT">IT</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: Grievance Details */}
          <div className="panel">
            <div className="panel-head">
              <span>Grievance Details</span>
            </div>
            <div className="panel-body">
              <div className="section-title">
                <span className="step-badge">2</span> Grievance Description
              </div>

              <div className="field">
                <label htmlFor="description">
                  Grievance Description (maximum 150 words) <span className="req">*</span>
                </label>
                <textarea
                  id="description"
                  placeholder="Describe your grievance clearly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <div className={`wordcount ${isWordCountOver ? 'over' : ''}`}>
                  {words} / 150 words
                </div>
              </div>

              {/* Want to upload Document? */}
              <div className="field" style={{ marginTop: 16 }}>
                <label>Want to upload Document?</label>
                <div className="radio-row">
                  <label>
                    <input
                      type="radio"
                      name="wantUpload"
                      value="Yes"
                      checked={wantUpload === 'Yes'}
                      onChange={() => setWantUpload('Yes')}
                    />{' '}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="wantUpload"
                      value="No"
                      checked={wantUpload === 'No'}
                      onChange={() => {
                        setWantUpload('No');
                        setSelectedFile(null);
                      }}
                    />{' '}
                    No
                  </label>
                </div>

                {wantUpload === 'Yes' && (
                  <div className="file-row">
                    <input
                      type="file"
                      id="document"
                      accept=".docx,.pdf,.jpeg,.jpg"
                      onChange={handleFileChange}
                    />
                    <span className="file-hint">
                      (*.docx, *.pdf, *.jpeg — max 10MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Committee Members list */}
              <div style={{ marginTop: 22 }}>
                <div className="section-title">
                  <span className="step-badge">3</span> Grievance Redressal Committee @NEC
                </div>
                <ul className="committee-list">
                  {COMMITTEE.map((c, i) => (
                    <li key={i}>
                      <b>{c.name}</b> — {c.dept} ({c.post})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Declaration Checkbox */}
              <label className="declare">
                <input
                  type="checkbox"
                  id="declared"
                  checked={declared}
                  onChange={(e) => setDeclared(e.target.checked)}
                />
                <span>
                  I hereby declare that the information/document provided above is correct.
                  I shall be responsible for furnishing any wrong information/document.
                </span>
              </label>

              {/* Feedback Result Message Box */}
              {errorMessage && (
                <div className="msg error" role="alert">
                  {errorMessage}
                </div>
              )}

              {successData && (
                <div className="msg success success-card">
                  <div>{successData.message}</div>
                  <div className="gid">Your GID: {successData.gid}</div>
                  <div style={{ marginTop: 8, fontSize: '12px' }}>
                    A confirmation email has been sent to you, and the committee has been notified.
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                className="submit-btn"
                type="submit"
                id="submitBtn"
                disabled={isSubmitting || isWordCountOver}
                style={{ marginTop: 16 }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
