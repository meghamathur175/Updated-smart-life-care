import React from "react";
import "../styles/ProfilePage.css"; 

const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Profile Details</h2>
        {user ? (
          <div className="profile-info">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            {/* Add more fields as needed */}
          </div>
        ) : (
          <p>No user data found.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
