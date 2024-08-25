import React, { useState } from "react";
import Select from "react-select";
import CustomNavbar from "../Layouts/CustomNavbar";
import { Country, State } from "country-state-city";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../Services/firebaseConfig";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

 
const RegistrationForm = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    cell: "",
    occupation: "",
    role: "user" // Default role
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

    if (!formData.cell.trim()) {
      newErrors.cell = "Cell is required";
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = "Occupation is required";
    }

    if (!profilePicture) {
      newErrors.profilePicture = "Profile picture is required";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setError((prevErrors) => ({ ...prevErrors, profilePicture: "" }));
    }
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

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
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

      let profilePictureUrl = "";
      if (profilePicture) {
        const fileExtension = profilePicture.name.split('.').pop();
        const fileName = `${userCredential.user.uid}.${fileExtension}`;
        const storageRef = ref(storage, `profilePictures/${fileName}`);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, profilePicture);
        
        // Get the download URL
        profilePictureUrl = await getDownloadURL(snapshot.ref);
      }
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
        cell: formData.cell,
        occupation: formData.occupation,
        profilePictureUrl,
        role: formData.role, // Include the role in the user data
      };
      console.log("Storing user data in Firestore...");

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      // Update the current user in the auth context
      setCurrentUser(userCredential.user);
      console.log("Registration successful, redirecting to dashboard...");
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

    <>
      <CustomNavbar />
    
    <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center fs-2 mb-4" 
            style={{ color: '#ffc107', fontWeight: 'bold' }}> Registration Form </h2>
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">First Name</label>
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
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
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
                    {error.lastName && <span className="text-danger">{error.lastName}</span>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
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
                    {error.phone && <span className="text-danger">{error.phone}</span>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="cell" className="form-label">Cell</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cell"
                      id="cell"
                      value={formData.cell}
                      onChange={handleChange}
                      placeholder="Cell"
                      required
                    />
                    {error.cell && <span className="text-danger">{error.cell}</span>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
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
                  {error.email && <span className="text-danger">{error.email}</span>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="form-control"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your Password"
                    required
                    style={{ paddingRight: '40px' }} // Add padding to prevent text overlap with the icon
                  />
                  <div className="input-group-append position-absolute end-0 top-50 translate-middle-y" style={{ zIndex: 10, paddingRight: '10px' }}>
                  <button
                        type="button"
                        className="btn btn-link"
                        onClick={togglePasswordVisibility}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={passwordVisible ? faEyeSlash : faEye}
                          style={{ color: '#6c757d' }}
                        />
                      </button>
                    </div>
                    </div>
                  {error.password && <span className="text-danger">{error.password}</span>}
                </div>

               <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">Gender</label>
                    <select
                      className="form-select"
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
                    {error.gender && <span className="text-danger">{error.gender}</span>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                    {error.dateOfBirth && <span className="text-danger">{error.dateOfBirth}</span>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="country" className="form-label">Country</label>
                    <Select
                      id="country"
                      name="country"
                      options={countries}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      placeholder="Select your Country"
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                      required
                    />
                    {error.country && <span className="text-danger">{error.country}</span>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="state" className="form-label">State</label>
                    <Select
                      id="state"
                      name="state"
                      options={statesOptions}
                      value={selectedState}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      onChange={handleStateChange}
                      placeholder="Select your state"
                      isClearable
                      isDisabled={!selectedCountry}
                      required
                    />
                    {error.state && <span className="text-danger">{error.state}</span>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="city" className="form-label">City</label>
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
                    {error.city && <span className="text-danger">{error.city}</span>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="church" className="form-label">Church</label>
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
                    {error.church && <span className="text-danger">{error.church}</span>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="zone" className="form-label">Zone</label>
                    <select
                      className="form-select"
                      name="zone"
                      id="zone"
                      value={formData.zone}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select your Church/Zone</option>
                      <option value="Awka zone">Awka zone</option>
                      <option value="Nnewi zone">Nnewi zone</option>
                      <option value="Owerri zone">Owerri zone</option>
                      <option value="Ekwulobia zone">Ekwulobia zone</option>
                    </select>
                    {error.zone && <span className="text-danger">{error.zone}</span>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="occupation" className="form-label">Occupation</label>
                  <input
                    type="text"
                    className="form-control"
                    name="occupation"
                    id="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Enter your Occupation"
                    required
                  />
                  {error.occupation && <span className="text-danger">{error.occupation}</span>}
                </div>

                <div className="mb-3">
                  <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
                  <input
                    type="file"
                    className="form-control"
                    name="profilePicture"
                    id="profilePicture"
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    required
                  />
                  {error.profilePicture && <span className="text-danger">{error.profilePicture}</span>}
                </div>

                <div className="d-grid mb-3">

                  <button
                    type="submit"
                    className="btn btn"
                    style={{ height: '3em', backgroundColor: isHovered ? '#cc8a00' : '#ffc107', 
                    color: isHovered ? "white" : "black", fontSize: "1.1em", fontWeight: "bolder", 
                    border: 'none', transition: 'background-color 0.3s', cursor: 'pointer'  }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>
                  {error.form && <span className="text-danger mt-2">{error.form}</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    </>
  );
};

export default RegistrationForm;
