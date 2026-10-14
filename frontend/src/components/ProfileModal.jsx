import React, { useState, useEffect, useRef } from "react";
import API from "../api/apiClient";
import { toast } from "./ToastContainer";
import { 
  FaTimes, 
  FaUser, 
  FaBriefcase, 
  FaGraduationCap, 
  FaFileAlt, 
  FaCamera, 
  FaPlus, 
  FaTrash, 
  FaCloudUploadAlt, 
  FaDownload, 
  FaSpinner 
} from "react-icons/fa";

import styles from "../styles/components/ProfileModal.module.css";

export default function ProfileModal({ isOpen, onClose, initialTab = "general", currentUser, onUserUpdated }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Form states
  const [general, setGeneral] = useState({
    name: "",
    headline: "",
    bio: "",
    phoneNumber: "",
    location: "",
    skills: ""
  });

  const [experiences, setExperiences] = useState([]);
  const [educationHistory, setEducationHistory] = useState([]);
  const [resume, setResume] = useState(null);

  // Experience sub-form modal/inline
  const [newExp, setNewExp] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: ""
  });
  const [showAddExp, setShowAddExp] = useState(false);

  // Education sub-form inline
  const [newEdu, setNewEdu] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: ""
  });
  const [showAddEdu, setShowAddEdu] = useState(false);

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch complete profile on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get("/profile/me");
        if (res.data && res.data.profile) {
          const p = res.data.profile;
          setGeneral({
            name: res.data.user?.name || p.name || "",
            headline: p.headline || "",
            bio: p.bio || "",
            phoneNumber: p.phoneNumber || "",
            location: p.location || "",
            skills: Array.isArray(p.skills) ? p.skills.join(", ") : (p.skills || "")
          });
          setExperiences(p.experiences || []);
          setEducationHistory(p.educationHistory || []);
          setResume(p.resume || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        toast("Failed to load profile details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle avatar image selection
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file (JPEG, PNG, WebP)", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast("Image size cannot exceed 3MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await API.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        toast("Profile picture updated successfully!", "success");
        if (onUserUpdated && res.data.user) {
          onUserUpdated(res.data.user);
        }
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast(err.response?.data?.error || "Failed to upload avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Resume upload
  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("Resume file cannot exceed 5MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploadingResume(true);
    try {
      const res = await API.post("/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setResume(res.data.resume);
        toast("Resume uploaded successfully!", "success");
      }
    } catch (err) {
      console.error("Resume upload failed:", err);
      toast(err.response?.data?.error || "Failed to upload resume", "error");
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle Resume deletion
  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to remove your resume?")) return;

    try {
      const res = await API.delete("/profile/resume");
      if (res.data.success) {
        setResume(null);
        toast("Resume removed", "info");
      }
    } catch (err) {
      console.error("Failed to delete resume:", err);
      toast("Failed to delete resume", "error");
    }
  };

  // Add Experience
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExp.company.trim() || !newExp.role.trim()) {
      toast("Company and Role are required", "warning");
      return;
    }
    setExperiences([...experiences, { ...newExp }]);
    setNewExp({ company: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "" });
    setShowAddExp(false);
  };

  const handleDeleteExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Add Education
  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!newEdu.institution.trim()) {
      toast("Institution name is required", "warning");
      return;
    }
    setEducationHistory([...educationHistory, { ...newEdu }]);
    setNewEdu({ institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" });
    setShowAddEdu(false);
  };

  const handleDeleteEducation = (index) => {
    setEducationHistory(educationHistory.filter((_, i) => i !== index));
  };

  // Save full profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const skillsArray = general.skills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        name: general.name,
        headline: general.headline,
        bio: general.bio,
        phoneNumber: general.phoneNumber,
        location: general.location,
        skills: skillsArray,
        experiences,
        educationHistory
      };

      const res = await API.put("/profile/me", payload);
      if (res.data.success) {
        toast("Profile saved successfully!", "success");
        if (onUserUpdated && currentUser) {
          onUserUpdated({ ...currentUser, name: general.name });
        }
        onClose();
      }
    } catch (err) {
      console.error("Save profile error:", err);
      toast(err.response?.data?.error || "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Profile</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Tab Bar */}
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabBtn} ${activeTab === "general" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <FaUser /> General
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "experience" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            <FaBriefcase /> Experience ({experiences.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "education" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("education")}
          >
            <FaGraduationCap /> Education ({educationHistory.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "resume" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("resume")}
          >
            <FaFileAlt /> Resume / CV
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.emptyState}>
              <FaSpinner className="fa-spin" style={{ fontSize: "28px", color: "var(--accent-color)" }} />
              <p style={{ marginTop: "12px" }}>Loading your profile...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: GENERAL */}
              {activeTab === "general" && (
                <div>
                  <div className={styles.avatarSection}>
                    <div className={styles.avatarPreview}>
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="Avatar" className={styles.avatarImg} />
                      ) : (
                        (general.name || currentUser?.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={styles.avatarActions}>
                      <button 
                        className={styles.avatarUploadBtn} 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? <FaSpinner className="fa-spin" /> : <FaCamera />}
                        {uploadingAvatar ? "Uploading..." : "Change Profile Photo"}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: "none" }} 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handleAvatarChange}
                      />
                      <span className={styles.avatarHint}>JPEG, PNG, WebP up to 3MB (Optimized via Cloudinary)</span>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={general.name} 
                        onChange={(e) => setGeneral({ ...general, name: e.target.value })} 
                        placeholder="John Doe"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Headline / Title</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={general.headline} 
                        onChange={(e) => setGeneral({ ...general, headline: e.target.value })} 
                        placeholder="e.g. Senior Software Engineer"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Location</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={general.location} 
                        onChange={(e) => setGeneral({ ...general, location: e.target.value })} 
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone Number</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={general.phoneNumber} 
                        onChange={(e) => setGeneral({ ...general, phoneNumber: e.target.value })} 
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.formLabel}>Skills (comma separated)</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={general.skills} 
                        onChange={(e) => setGeneral({ ...general, skills: e.target.value })} 
                        placeholder="React, Node.js, Python, TypeScript, Docker"
                      />
                    </div>

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.formLabel}>About / Bio</label>
                      <textarea 
                        className={styles.formTextarea} 
                        value={general.bio} 
                        onChange={(e) => setGeneral({ ...general, bio: e.target.value })} 
                        placeholder="Brief summary of your background, career interests, or accomplishments..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPERIENCE */}
              {activeTab === "experience" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Work Experience</h3>
                    <button className={styles.addBtn} onClick={() => setShowAddExp(!showAddExp)}>
                      <FaPlus /> {showAddExp ? "Cancel" : "Add Position"}
                    </button>
                  </div>

                  {showAddExp && (
                    <form onSubmit={handleAddExperience} style={{ marginBottom: "20px", padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Company *</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newExp.company} 
                            onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} 
                            required 
                            placeholder="e.g. Google"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Role / Job Title *</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newExp.role} 
                            onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} 
                            required 
                            placeholder="e.g. Software Engineer"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Start Date</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newExp.startDate} 
                            onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })} 
                            placeholder="e.g. Jan 2022"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>End Date</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newExp.endDate} 
                            onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })} 
                            placeholder={newExp.isCurrent ? "Present" : "e.g. Dec 2024"} 
                            disabled={newExp.isCurrent}
                          />
                        </div>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                            <input 
                              type="checkbox" 
                              checked={newExp.isCurrent} 
                              onChange={(e) => setNewExp({ ...newExp, isCurrent: e.target.checked })} 
                            />
                            I currently work in this role
                          </label>
                        </div>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                          <label className={styles.formLabel}>Description / Responsibilities</label>
                          <textarea 
                            className={styles.formTextarea} 
                            value={newExp.description} 
                            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} 
                            placeholder="Describe your impact, tools used, key accomplishments..."
                          />
                        </div>
                      </div>
                      <button type="submit" className={styles.saveBtn} style={{ marginTop: "8px" }}>
                        Save Position
                      </button>
                    </form>
                  )}

                  {experiences.length === 0 ? (
                    <div className={styles.emptyState}>No work experiences added yet. Click "Add Position" above.</div>
                  ) : (
                    <div className={styles.itemList}>
                      {experiences.map((exp, idx) => (
                        <div key={idx} className={styles.itemCard}>
                          <div className={styles.itemMain}>
                            <div className={styles.itemTitle}>{exp.role}</div>
                            <div className={styles.itemSubtitle}>{exp.company}</div>
                            <div className={styles.itemDates}>
                              {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate || "N/A"}
                            </div>
                            {exp.description && <div className={styles.itemDesc}>{exp.description}</div>}
                          </div>
                          <button 
                            className={styles.deleteItemBtn} 
                            onClick={() => handleDeleteExperience(idx)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EDUCATION */}
              {activeTab === "education" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Education</h3>
                    <button className={styles.addBtn} onClick={() => setShowAddEdu(!showAddEdu)}>
                      <FaPlus /> {showAddEdu ? "Cancel" : "Add Education"}
                    </button>
                  </div>

                  {showAddEdu && (
                    <form onSubmit={handleAddEducation} style={{ marginBottom: "20px", padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                      <div className={styles.formGrid}>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                          <label className={styles.formLabel}>School / University *</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newEdu.institution} 
                            onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} 
                            required 
                            placeholder="e.g. Stanford University"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Degree</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newEdu.degree} 
                            onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} 
                            placeholder="e.g. Bachelor of Science"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Field of Study</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newEdu.fieldOfStudy} 
                            onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })} 
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Start Year</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newEdu.startYear} 
                            onChange={(e) => setNewEdu({ ...newEdu, startYear: e.target.value })} 
                            placeholder="e.g. 2018"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>End Year (or Expected)</label>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            value={newEdu.endYear} 
                            onChange={(e) => setNewEdu({ ...newEdu, endYear: e.target.value })} 
                            placeholder="e.g. 2022"
                          />
                        </div>
                      </div>
                      <button type="submit" className={styles.saveBtn} style={{ marginTop: "8px" }}>
                        Save Education
                      </button>
                    </form>
                  )}

                  {educationHistory.length === 0 ? (
                    <div className={styles.emptyState}>No education details added yet. Click "Add Education" above.</div>
                  ) : (
                    <div className={styles.itemList}>
                      {educationHistory.map((edu, idx) => (
                        <div key={idx} className={styles.itemCard}>
                          <div className={styles.itemMain}>
                            <div className={styles.itemTitle}>{edu.institution}</div>
                            <div className={styles.itemSubtitle}>
                              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                            </div>
                            {(edu.startYear || edu.endYear) && (
                              <div className={styles.itemDates}>
                                {edu.startYear || "N/A"} - {edu.endYear || "Present"}
                              </div>
                            )}
                          </div>
                          <button 
                            className={styles.deleteItemBtn} 
                            onClick={() => handleDeleteEducation(idx)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RESUME / CV */}
              {activeTab === "resume" && (
                <div>
                  <div 
                    className={styles.resumeDropzone} 
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={resumeInputRef} 
                      style={{ display: "none" }} 
                      accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      onChange={handleResumeChange} 
                    />
                    {uploadingResume ? (
                      <>
                        <FaSpinner className="fa-spin" style={{ fontSize: "38px", color: "var(--accent-color)" }} />
                        <div className={styles.dropzoneText}>Uploading to Cloud Storage...</div>
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt className={styles.dropzoneIcon} />
                        <div className={styles.dropzoneText}>Click to upload your Resume / CV</div>
                        <div className={styles.dropzoneHint}>Supports PDF, DOC, DOCX up to 5MB</div>
                      </>
                    )}
                  </div>

                  {resume && (
                    <div className={styles.resumeCard}>
                      <div className={styles.resumeInfo}>
                        <FaFileAlt className={styles.resumeFileIcon} />
                        <div>
                          <div className={styles.resumeFileName}>{resume.originalName || "Uploaded Resume.pdf"}</div>
                          <div className={styles.resumeMeta}>
                            {resume.sizeBytes ? `${(resume.sizeBytes / 1024).toFixed(1)} KB • ` : ""}
                            Uploaded {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : "recently"}
                          </div>
                        </div>
                      </div>
                      <div className={styles.resumeActions}>
                        {resume.url && (
                          <a 
                            href={resume.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.resumeActionBtn}
                            download
                          >
                            <FaDownload /> Download
                          </a>
                        )}
                        <button 
                          className={`${styles.resumeActionBtn} ${styles.resumeDeleteBtn}`}
                          onClick={handleDeleteResume}
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={saving || loading}>
            {saving ? <FaSpinner className="fa-spin" /> : null}
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
