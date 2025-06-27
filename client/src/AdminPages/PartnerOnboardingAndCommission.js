import { useState, useEffect } from "react";
import "../styles/PartnerOnboardingAndCommission.css";
import axios from "axios";

export default function AdminDashboard() {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    address: "",
    serviceAreas: "",
    commission: 3,
    hospitalPlaceId: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const YOUR_GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const apiUrl = "http://localhost:3001/api/partners";

  useEffect(() => {
    fetchPartners();
  }, []);

  // To refreshes the partner list after successful add/edit
  const fetchPartners = async () => {
    try {
      const response = await axios.get(apiUrl);
      console.log("PARTNERS: ", response);
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
    if (!form.email.trim()) errs.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email format is invalid";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.serviceAreas.trim()) errs.serviceAreas = "Service areas required";
    if (!form.hospitalPlaceId.trim()) errs.hospitalPlaceId = "Hospital Place ID is required";
    if (Number(form.commission) < 3 || Number(form.commission) > 5)
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

    // Convert address to coordinates using Google Geocoding API
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        form.address
      )}&key=${YOUR_GOOGLE_MAPS_API_KEY}`
    );

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert("Failed to geocode the address. Please check the address.");
      return;
    }

    const { lat, lng } = geoData.results[0].geometry.location;


    setErrors({});
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      location: { type: "Point", coordinates: [lng, lat] },
      serviceAreas: form.serviceAreas.trim(),
      commission: Number(form.commission),
      hospitalPlaceId: form.hospitalPlaceId.trim(),
    };

    console.log("Submitting data:", payload);

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
      email: partner.email || "",
      address: partner.address,
      serviceAreas: partner.serviceAreas,
      commission: partner.commission,
      hospitalPlaceId: partner.hospitalPlaceId || "",

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
      email: "",
      address: "",
      serviceAreas: "",
      commission: 3,
      hospitalPlaceId: "",
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
              Hospital Name:
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
            <label className="poa-label" htmlFor="email">
              Email:
            </label>
            <input
              id="email"
              className="poa-input-text"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <small className="poa-error">{errors.email}</small>}
          </div>


          <div>
            <label className="poa-label" htmlFor="location">
              Address:
            </label>
            <input
              id="address"
              className="poa-input-text"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
            {errors.address && (
              <small className="poa-error">{errors.address}</small>
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
              step="0.1"
              min="3"
              max="5"
              value={form.commission}
              onChange={handleChange}
            />
            {errors.commission && (
              <small className="poa-error">{errors.commission}</small>
            )}
          </div>

          <div>
            <label className="poa-label" htmlFor="hospitalPlaceId">
              Hospital Place ID:
            </label>
            <input
              id="hospitalPlaceId"
              className="poa-input-text"
              type="text"
              name="hospitalPlaceId"
              value={form.hospitalPlaceId}
              onChange={handleChange}
            />
            {errors.hospitalPlaceId && (
              <small className="poa-error">{errors.hospitalPlaceId}</small>
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
              <th>S. No</th>
              <th>Partner Name</th>
              <th>Location</th>
              <th>Service Areas</th>
              <th>Requests</th>
              <th>Commission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p, idx) => (
              <tr key={p._id || p.id}>
                <td data-label="SNo">{idx + 1}</td>
                <td data-label="Name">{p.name}</td>
                <td data-label="Location">{p.address}</td>
                <td data-label="Service Areas">{p.serviceAreas}</td>
                <td data-label="Requests">{p.pendingRequests?.length || 0}</td>
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
