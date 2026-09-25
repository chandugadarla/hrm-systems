import "../css/EmployeeProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloudinaryUpload from "../components/CloudinaryUpload";

const defaultEmployeeProfile = {
  name: "Rahul Sharma",
  email: "rahul@company.com",
  phone: "+91 98765 12345",
  dob: "22 August 2001",
  joiningDate: "15 July 2025",
  bloodGroup: "O+",
  role: "Software Engineer",
  department: "Information Technology",
  experience: "1 Year",
  location: "Hyderabad, Telangana",
  achievements:
    "Contributed to internal web applications, REST APIs and automation projects. Successfully completed multiple development assignments.",
  image: "https://randomuser.me/api/portraits/men/32.jpg",
};

const EmployeeProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(
    defaultEmployeeProfile
  );

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const savedProfile =
      localStorage.getItem("employeeProfile");

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {
        setProfile(defaultEmployeeProfile);
      }
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = (imageUrl) => {
    setProfile((previous) => ({
      ...previous,
      image: imageUrl,
    }));
  };

  const handleSave = () => {
    localStorage.setItem(
      "employeeProfile",
      JSON.stringify(profile)
    );

    setEditing(false);

    alert("Profile updated successfully.");
  };

  const handleCancel = () => {
    const savedProfile =
      localStorage.getItem("employeeProfile");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile(defaultEmployeeProfile);
    }

    setEditing(false);
  };

  return (
    <div className="profile-page">

      <div className="profile-topbar">

        <button
          className="back-btn"
          onClick={() => navigate("/employee-dashboard")}
        >
          ← Back to Dashboard
        </button>

      </div>

      <div className="profile-container">

        <div className="profile-heading">

          <div>
            <span className="profile-label">
              EMPLOYEE PROFILE
            </span>

            <h1>My Profile</h1>

            <p>
              View and manage your employee information.
            </p>
          </div>

          {!editing ? (
            <button
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
            >
              ✎ Edit Profile
            </button>
          ) : (
            <div className="profile-actions">

              <button
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={handleSave}
              >
                ✓ Save Changes
              </button>

            </div>
          )}

        </div>

        <div className="profile-card">

          <div className="profile-cover"></div>

          <div className="profile-main">

            <div className="profile-photo-section">

              <CloudinaryUpload
                currentImage={profile.image}
                onUpload={handleImageUpload}
              />

              <h2>{profile.name}</h2>

              <p>{profile.role}</p>

              <span className="active-badge">
                ● Active
              </span>

            </div>

            <div className="profile-details">

              <div className="detail-section">

                <h3>Personal Information</h3>

                <div className="details-grid">

                  <div className="detail-item">
                    <label>Full Name</label>

                    {editing ? (
                      <input
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.name}</strong>
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Email</label>
                    <strong>{profile.email}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Phone</label>

                    {editing ? (
                      <input
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.phone}</strong>
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Date of Birth</label>

                    {editing ? (
                      <input
                        name="dob"
                        value={profile.dob}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.dob}</strong>
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Blood Group</label>

                    {editing ? (
                      <select
                        name="bloodGroup"
                        value={profile.bloodGroup}
                        onChange={handleChange}
                      >
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                      </select>
                    ) : (
                      <strong className="blood-group">
                        {profile.bloodGroup}
                      </strong>
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Location</label>

                    {editing ? (
                      <input
                        name="location"
                        value={profile.location}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.location}</strong>
                    )}
                  </div>

                </div>

              </div>

              <div className="detail-section">

                <h3>Employment Information</h3>

                <div className="details-grid">

                  <div className="detail-item">
                    <label>Role</label>
                    <strong>{profile.role}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Department</label>
                    <strong>{profile.department}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Date of Joining</label>
                    <strong>{profile.joiningDate}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Experience</label>
                    <strong>{profile.experience}</strong>
                  </div>

                </div>

              </div>

              <div className="detail-section">

                <h3>Achievements & Experience</h3>

                {editing ? (
                  <textarea
                    name="achievements"
                    value={profile.achievements}
                    onChange={handleChange}
                    rows="4"
                  />
                ) : (
                  <p className="achievement-text">
                    {profile.achievements}
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EmployeeProfile;