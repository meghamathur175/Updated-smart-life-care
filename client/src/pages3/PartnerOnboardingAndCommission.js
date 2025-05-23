import { useState, useEffect } from "react";
import "../styles/PartnerOnboardingAndCommission.css";
import axios from "axios";

export default function AdminDashboard() {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    location: "",
    serviceAreas: "",
    commission: 3,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const apiUrl = "http://localhost:3001/api/Partners";

  useEffect(() => {
    fetchPartners();
  }, []);

  // To refreshes the partner list after successful add/edit
  const fetchPartners = async () => {
    try {
      const response = await axios.get(apiUrl);
      setPartners(response.data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  // Handles input changes in the form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.serviceAreas.trim()) errs.serviceAreas = "Service areas required";
    if (form.commission < 3 || form.commission > 5)
      errs.commission = "Commission must be between 3% and 5%";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const payload = {
      name: form.name,
      location: form.location,
      serviceAreas: form.serviceAreas,
      commission: Number(form.commission),
    };

    try {
      if (isEditing) {
        await axios.put(`${apiUrl}/${form.id}`, payload, {
          withCredentials: true,
        });
        alert("Partner updated successfully!");
      } else {
        await axios.post(apiUrl, payload, {
          withCredentials: true,
        });
        alert("Partner added successfully!");
      }

      await fetchPartners();
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save partner. Please try again.");
    }
  };  

  const handleEdit = (partner) => {
    setForm({
      id: partner._id || partner.id, // to support both id formats
      name: partner.name,
      location: partner.location,
      serviceAreas: partner.serviceAreas,
      commission: partner.commission,
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      try {
        await axios.delete(`${apiUrl}/${id}`, {
          withCredentials: true,
        });
        setPartners((prev) => prev.filter((p) => (p._id || p.id) !== id));
        alert("Partner deleted successfully!");
      } catch (error) {
        console.error("Error deleting partner:", error);
        alert("Failed to delete partner. Please try again.");
      }
    }
  };

  // To Clear the form inputs and resets the editing state.
  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      location: "",
      serviceAreas: "",
      commission: 3,
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="poa-dashboard-container">
      <div className="poa-main-content">
        <h2>Partner Onboarding</h2>
        <form className="poa-form" onSubmit={handleSubmit}>
          <div>
            <label className="poa-label" htmlFor="name">
              Name:
            </label>
            <input
              id="name"
              className="poa-input-text"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <small className="poa-error">{errors.name}</small>}
          </div>

          <div>
            <label className="poa-label" htmlFor="location">
              Location:
            </label>
            <input
              id="location"
              className="poa-input-text"
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
            />
            {errors.location && (
              <small className="poa-error">{errors.location}</small>
            )}
          </div>

          <div>
            <label className="poa-label" htmlFor="serviceAreas">
              Service Areas:
            </label>
            <input
              id="serviceAreas"
              className="poa-input-text"
              type="text"
              name="serviceAreas"
              value={form.serviceAreas}
              onChange={handleChange}
            />
            {errors.serviceAreas && (
              <small className="poa-error">{errors.serviceAreas}</small>
            )}
          </div>

          <div>
            <label className="poa-label" htmlFor="commission">
              Commission (%):
            </label>
            <input
              id="commission"
              className="poa-input-number"
              type="number"
              name="commission"
              min="3"
              max="5"
              value={form.commission}
              onChange={handleChange}
            />
            {errors.commission && (
              <small className="poa-error">{errors.commission}</small>
            )}
          </div>

          <div className="poa-form-buttons">
            <button className="poa-submit-btn" type="submit">
              {isEditing ? "Update Partner" : "Add Partner"}
            </button>
            {isEditing && (
              <button
                className="poa-cancel-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h3 className="poa-partners-heading">Partners List</h3>
        <table className="poa-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Service Areas</th>
              <th>Commission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id || p.id}>
                <td data-label="Name">{p.name}</td>
                <td data-label="Location">{p.location}</td>
                <td data-label="Service Areas">{p.serviceAreas}</td>
                <td data-label="Commission">{p.commission}%</td>
                <td data-label="" className="admin-btns-container">
                  <button className="poa-edit-btn" onClick={() => handleEdit(p)}>
                    Edit
                  </button>
                  <button
                    className="poa-delete-btn"
                    onClick={() => handleDelete(p._id || p.id)}
                    style={{ marginLeft: "8px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
