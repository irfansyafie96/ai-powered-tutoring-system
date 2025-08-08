import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../api/api";
import styles from "../styles/Profile.module.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
        setNewUsername(userData.username);
      } catch (err) {
        setMessage("Failed to load profile.");
        setMessageType("error");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const updateData = {};
      if (newUsername !== user.username) updateData.username = newUsername;
      if (changePassword && newPassword) updateData.password = newPassword;

      if (!Object.keys(updateData).length) {
        setMessage("Nothing to update.");
        setMessageType("error");
        return;
      }

      const updatedUser = await updateProfile(updateData);
      setUser(updatedUser);
      setMessage("Profile updated successfully.");
      setMessageType("success");
      setNewPassword("");
      setChangePassword(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update profile.");
      setMessageType("error");
    }
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileContainer}>
        <h2>Profile</h2>

        {message && (
          <div className={`${styles.profileMessage} ${styles[messageType]}`}>
            {message}
          </div>
        )}

        <div className={styles.profileField}>
          <label>Email (read-only)</label>
          <input type="text" value={user.email} readOnly />
        </div>

        <div className={styles.profileField}>
          <label>Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>

        {!changePassword && (
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setChangePassword(true)}
          >
            Change Password
          </button>
        )}

        {changePassword && (
          <div className={styles.profileField}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        )}

        <div className={styles.profileActions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleUpdate}
          >
            Save Changes
          </button>
          {changePassword && (
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => {
                setChangePassword(false);
                setNewPassword("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
