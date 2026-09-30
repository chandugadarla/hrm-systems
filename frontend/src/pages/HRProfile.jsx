import "../css/HRProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloudinaryUpload from "../components/CloudinaryUpload";

const defaultProfile = {
  name: "HR Administrator",
  email: "hr@company.com",
  phone: "+91 98765 43210",
  dob: "15 March 1995",
  joiningDate: "10 June 2021",
  bloodGroup: "B+",
  role: "HR Administrator",
  department: "Human Resources",
  experience: "5 Years",
  location: "Hyderabad, Telangana",
  achievements:
    "Employee engagement, recruitment management, talent acquisition and HR operations.",
  image: "https://i.pravatar.cc/400?img=47",
};

function HRProfile() {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);

  // Load saved HR profile
  useEffect(() => {
    const savedProfile = localStorage.getItem("hr_profile");

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Failed to load HR profile:", error);
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
    localStorage.setItem("hr_profile", JSON.stringify(profile));
    setEditing(false);
    alert("Profile updated successfully.");
  };

  const handleCancel = () => {
    const savedProfile = localStorage.getItem("hr_profile");

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {
        setProfile(defaultProfile);
      }
    } else {
      setProfile(defaultProfile);
    }

    setEditing(false);
  };

  return (
    <div className="profile-page">
      {/* TOP BAR */}
      <div className="profile-topbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/hr-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="profile-container">
        {/* PAGE HEADER */}
        <div className="profile-heading">
          <div>
            <span className="profile-label">MY PROFILE</span>

            <h1>HR Profile</h1>

            <p>
              View and manage your HR account information.
            </p>
          </div>

          {!editing ? (
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
            >
              ✎ Edit Profile
            </button>
          ) : (
            <div className="profile-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={handleSave}
              >
                ✓ Save Changes
              </button>
            </div>
          )}
        </div>

        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-cover"></div>

          <div className="profile-main">
            {/* LEFT PROFILE AREA */}
            <div className="profile-photo-section">
              <CloudinaryUpload
                currentImage={profile.image}
                onUpload={handleImageUpload}
                disabled={!editing}
              />

              <h2>{profile.name}</h2>

              <p>{profile.role}</p>

              <span className="active-badge">
                ● Active
              </span>
            </div>

            {/* RIGHT DETAILS */}
            <div className="profile-details">
              {/* PERSONAL INFORMATION */}
              <div className="detail-section">
                <h3>Personal Information</h3>

                <div className="details-grid">
                  {/* NAME */}
                  <div className="detail-item">
                    <label>Full Name</label>

                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.name}</strong>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div className="detail-item">
                    <label>Email</label>

                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.email}</strong>
                    )}
                  </div>

                  {/* PHONE */}
                  <div className="detail-item">
                    <label>Phone</label>

                    {editing ? (
                      <input
                        type="text"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.phone}</strong>
                    )}
                  </div>

                  {/* DOB */}
                  <div className="detail-item">
                    <label>Date of Birth</label>

                    {editing ? (
                      <input
                        type="text"
                        name="dob"
                        value={profile.dob}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.dob}</strong>
                    )}
                  </div>

                  {/* BLOOD GROUP */}
                  <div className="detail-item">
                    <label>Blood Group</label>

                    {editing ? (
                      <select
                        name="bloodGroup"
                        value={profile.bloodGroup}
                        onChange={handleChange}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <strong className="blood-group">
                        {profile.bloodGroup}
                      </strong>
                    )}
                  </div>

                  {/* LOCATION */}
                  <div className="detail-item">
                    <label>Location</label>

                    {editing ? (
                      <input
                        type="text"
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

              {/* EMPLOYMENT INFORMATION */}
              <div className="detail-section">
                <h3>Employment Information</h3>

                <div className="details-grid">
                  {/* ROLE */}
                  <div className="detail-item">
                    <label>Role</label>

                    {editing ? (
                      <input
                        type="text"
                        name="role"
                        value={profile.role}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.role}</strong>
                    )}
                  </div>

                  {/* DEPARTMENT */}
                  <div className="detail-item">
                    <label>Department</label>

                    {editing ? (
                      <input
                        type="text"
                        name="department"
                        value={profile.department}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.department}</strong>
                    )}
                  </div>

                  {/* JOINING DATE */}
                  <div className="detail-item">
                    <label>Date of Joining</label>

                    {editing ? (
                      <input
                        type="text"
                        name="joiningDate"
                        value={profile.joiningDate}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.joiningDate}</strong>
                    )}
                  </div>

                  {/* EXPERIENCE */}
                  <div className="detail-item">
                    <label>Experience</label>

                    {editing ? (
                      <input
                        type="text"
                        name="experience"
                        value={profile.experience}
                        onChange={handleChange}
                      />
                    ) : (
                      <strong>{profile.experience}</strong>
                    )}
                  </div>
                </div>
              </div>

              {/* ACHIEVEMENTS */}
              <div className="detail-section">
                <h3>Achievements & Experience</h3>

                {editing ? (
                  <textarea
                    name="achievements"
                    value={profile.achievements}
                    onChange={handleChange}
                    rows="5"
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
}

export default HRProfile;
