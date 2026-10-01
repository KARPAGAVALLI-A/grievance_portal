import React from 'react';
import { Link } from 'react-router-dom';

const COMMITTEE_MEMBERS = [
  { name: 'Dr.K.Kalidasa Murugavel', role: 'Principal', post: 'Chairperson' },
  { name: 'Dr. G.S.R.Emil Selvan', role: 'Associate Professor, Thiagarajar College of Engineering, Madurai', post: 'Senior Professor — Affiliating University Member' },
  { name: 'Dr.M.A.Neelakantan', role: 'Sr.Dean(R&D), Prof & Head/S&H', post: 'Senior Faculty' },
  { name: 'Dr.B.Paramasivan', role: 'Dean(SA&IR), Prof/AI&DS', post: 'Senior Faculty' },
  { name: 'Dr.S.Iyahraja', role: 'Prof & Head/Mech', post: 'Senior Faculty' },
  { name: 'Dr.S.Tamil Selvi', role: 'Prof & Head/ECE', post: 'Senior Faculty' },
  { name: 'Dr.V.Gomathi', role: 'Prof & Head/CSE', post: 'Senior Faculty' },
  { name: 'Dr.M.Willjuicelruthayarajan', role: 'Prof & Head/EEE', post: 'Senior Faculty' },
  { name: 'Dr.K.G.Srinivasagan', role: 'Prof & Head/IT', post: 'Senior Faculty' },
  { name: 'Dr.I.Padmanaban', role: 'Prof & Head/Civil', post: 'Senior Faculty' },
  { name: 'Dr.V.Kalaivani', role: 'Prof & Head/AI&DS', post: 'Senior Faculty' },
];

export default function Home() {
  return (
    <>
      <div className="campus-banner">
        <div className="caption">National Engineering College Campus</div>
      </div>

      <main className="home-main">
        <div className="intro">
          <h2>Welcome to NEC's Grievance Redressal Portal</h2>
          <p>
            The grievance redressal system of an organization is the gauge to measure its efficiency
            and effectiveness, as it provides important feedback on the working of the organization.
            It helps the organization to deliver quality service to the public and other stakeholders
            in a hassle-free manner and in eliminating the cause of grievances.
          </p>
          <p>
            This portal is intended to undertake the process of attending to the grievances put forward
            by the students, faculty and stakeholders. Complainants can submit their grievances along
            with correct contact details during the submission, and a unique file identification number
            will be assigned.
          </p>
        </div>

        <div className="panel">
          <div className="panel-head">Functions of the Committee</div>
          <div className="panel-body">
            <ul className="functions-list">
              <li>
                To adhere to the standard arbitration procedures of the college and those of AICTE Act 1987(52 of 1987) and AICTE (Establishment of Mechanism for Grievance Redressal) Regulations, 2012 or other such enactments of the AICTE from time to time
              </li>
              <li>
                To receive appeals, through online submissions and send acknowledgement to the complainant
              </li>
              <li>
                To identify the gravity of the appeal into academic, administrative and discipline-oriented
              </li>
              <li>
                To form a sub-committee among them to initiate the redressal operation within 3 days
              </li>
              <li>
                To ascertain the individuals to be involved in the enquiry and shall take appropriate action as deem fit and dispose the redress of grievance
              </li>
              <li>
                To escalate to higher authorities, if the complaint is not resolved and closed within 30 days
              </li>
            </ul>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">Members of the Committee</div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="committee">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Designation / Department</th>
                  <th>Post</th>
                </tr>
              </thead>
              <tbody>
                {COMMITTEE_MEMBERS.map((m, index) => (
                  <tr key={index}>
                    <td>{m.name}</td>
                    <td>{m.role}</td>
                    <td className="post">{m.post}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="register-cta">
          <div className="text">
            <h3>Ready to submit a grievance?</h3>
            <p>Fill in your details and description — you'll receive a confirmation email with your GID.</p>
          </div>
          <Link to="/register">Click here to Register →</Link>
        </div>
      </main>
    </>
  );
}
