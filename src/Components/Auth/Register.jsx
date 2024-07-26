import React, { useState } from "react";
import Select from "react-select";
import { Country, State } from "country-state-city";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../Services/firebaseConfig";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    country: "",
    state: "",
    city: "",
    church: "",
    zone: "",
  });

  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    //First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    }

    //Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Phone validation (allowing for international numbers)
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    // State validation
    if (!formData.state) {
      newErrors.state = "State is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.church) {
      newErrors.church = "Church is required";
    }

    if (!formData.zone) {
      newErrors.zone = "Zone is required";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError((prevErrors) => ({ ...prevErrors, [name]: "" }));

    // Clear the error for this field as the user types
    // setError({ ...error, [name]: "" });
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setStates(State.getStatesOfCountry(country.value));
    setSelectedState(null);
    setFormData({ ...formData, country: country.label, state: "" });
    setError({ ...error, country: "", state: "" });
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setFormData({ ...formData, state: state.label });
    setError({ ...error, state: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError({});
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    try {
      console.log("Starting user registration...");

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log("User created successfully:", userCredential.user.uid);

      // Prepare user data for Firestore
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: {
          country: formData.country,
          state: formData.state,
          city: formData.city,
        },
        church: formData.church,
        zone: formData.zone,
      };
      console.log("Storing user data in Firestore...");

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      console.log("User data stored successfully");

      // Update the current user in the auth context
      setCurrentUser(userCredential.user);
      console.log("Registration successful, redirecting to dashboard...");

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during registration:", error);
      setError({ form: `Registration failed: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const countries = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const statesOptions = states.map((state) => ({
    value: state.isoCode,
    label: state.name,
  }));

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4" style={{color: 'blue'}}>Registration Form</h2>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="First Name"
                      required
                    />
                    {error.firstName && (
                      <span className="error">{error.firstName}</span>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                    />
                    {error.lastName && (
                      <span className="error">{error.lastName}</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                  />
                  {error.phone && <span className="error">{error.phone}</span>}
                </div>
                <div className="mb-3">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                  {error.email && <span className="error">{error.email}</span>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your Password"
                    required
                  />
                  {error.password && (
                    <span className="error">{error.password}</span>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                    <label htmlFor="gender">Gender</label>
                    <select
                      className="form-control form-select"
                      name="gender"
                      id="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {error.gender && (
                      <span className="error">{error.gender}</span>
                    )}
                  </div>
                <div className="mb-3">
                  <label htmlFor="dateOfBirth">Select your date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    placeholder="Date of Birth"
                    required
                  />
                  {error.dateOfBirth && (
                    <span className="error">{error.dateOfBirth}</span>
                  )}
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3 country">
                    <label htmlFor="country">Country </label>
                    <Select
                      id="country"
                      name="country"
                      options={countries}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      placeholder="Select your Country"
                      isClearable
                      className="react-select-container form-control"
                      classNamePrefix="react-select"
                      required
                    />
                    {error.country && (
                      <span className="error">{error.country}</span>
                    )}
                  </div>
                  <div className="col-md-4 mb-3 state">
                    <label htmlFor="state">State</label>
                    <Select
                      id="state"
                      name="state"
                      options={statesOptions}
                      value={selectedState}
                      className="react-select-container form-control"
                      classNamePrefix="react-select"
                      onChange={handleStateChange}
                      placeholder="Select your state"
                      isClearable
                      isDisabled={!selectedCountry}
                      required
                    />
                    {error.state && (
                      <span className="error">{error.state}</span>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your City"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="church">Church</label>
                  <input
                    type="text"
                    className="form-control"
                    name="church"
                    id="church"
                    value={formData.church}
                    onChange={handleChange}
                    placeholder="Church"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="zone">Zone</label>
                  <select
                    type="text"
                    className="form-control"
                    name="zone"
                    id="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    placeholder="Select Zone"
                    required
                  >
                    <option value="" selected disabled>
                      Select your Church/Zone
                    </option>
                    <option value="Awka zone">Awka zone</option>
                    <option value="Nnewi zone">Nnewi zone</option>
                    <option value="Owerri zone">Owerri zone</option>
                    <option value="Ekwulobia zone">Ekwulobia zone</option>
                    <option value="TLBC Onitsha">TLBC Onitsha</option>
                  </select>
                  {error.zone && <span className="error">{error.zone}</span>}
                </div>
                <div className="d-grid mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100" style={{height: '3em'}}
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>
                {error.form && <span className="error">{error.form}</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
