import React, { useState } from "react";
import Select from "react-select";
import CustomNavbar from "../Layouts/CustomNavbar";
import { Country, State } from "country-state-city";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../Services/firebaseConfig";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

 
const FirstTimersForm = () => {
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
    role: "firstTimer", // Default role
    invitedBy: "",
    beAMember: "",
    maritalStatus: "",
    department: "",
    dateOfComing: "",
    visitDate: new Date(), // Assuming you're capturing the visit date
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

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (!formData.state) {
        newErrors.state = "State is required";
      }

      if (!formData.city) {
        newErrors.city = "City is required";
      }

    if (!formData.church) {
        newErrors.church = "Church is required";
      }

    if (!formData.invitedBy) {
      newErrors.invitedBy = "This field is required";
    }

    if (!formData.occupation) {
        newErrors.occupation = "This field is required";
      }

    if (!formData.beAMember) {
      newErrors.beAMember = "This field is required";
    }

    if (!formData.maritalStatus) {
        newErrors.maritalStatus = "This field is required";
      }

    if (!formData.department) {
      newErrors.department = "This field is required";
    }

    if (!formData.dateOfComing) {
        newErrors.dateOfComing = "This field is required";
      }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'email' ? value.toLowerCase() : value,
    }));
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

      // Convert email to lowercase before registration
    const lowerCaseEmail = formData.email.toLowerCase();
      
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
        invitedBy: formData.invitedBy,
        beAMember: formData.beAMember,
        maritalStatus: formData.maritalStatus,
        department: formData.department,
        dateOfComing: formData.dateOfComing,
        profilePictureUrl,
        role: formData.role, // Include the role in the user data
        visitDate: formData.visitDate,
      };
      console.log("Storing user data in Firestore...");

      // Store user data in Firestore under the 'FirstTimers' collection
      await setDoc(doc(db, "firsttimers", userCredential.user.uid), userData);

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
            style={{ color: '#ffc107', fontWeight: 'bold' }}>First Timers Form</h2>
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
                <div className="col-md-6">
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
                    <label htmlFor="invitedBy" className="form-label">Who invited you?</label>
                    <input
                      type="text"
                      className="form-control"
                      name="invitedBy"
                      id="invitedBy"
                      value={formData.invitedBy}
                      onChange={handleChange}
                      placeholder="Who invited you?"
                      required
                    />
                    {error.invitedBy && <span className="text-danger">{error.invitedBy}</span>}
                  </div>
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
                    <label htmlFor="city" className="form-label">Address (Street & city)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your Address"
                      required
                    />
                    {error.city && <span className="text-danger">{error.city}</span>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
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
                  <div className="col-md-4">
                    <label htmlFor="zone" className="form-label">Zone</label>
                    <select
                      className="form-select"
                      name="zone"
                      id="zone"
                      value={formData.zone}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select your zone</option>
                      <option value="Awka zone">Awka zone</option>
                      <option value="Nnewi zone">Nnewi zone</option>
                      <option value="Owerri zone">Owerri zone</option>
                      <option value="Ekwulobia zone">Ekwulobia zone</option>
                      <option value="others">Others</option>
                    </select>
                    {error.zone && <span className="text-danger">{error.zone}</span>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="cell" className="form-label">Cell</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cell"
                      id="cell"
                      value={formData.cell}
                      onChange={handleChange}
                      placeholder="Enter your Cell"
                      required
                    />
                    {error.cell && <span className="text-danger">{error.cell}</span>}
                  </div>
                </div>
                


                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="beAMember" className="form-label">Will you like to be a member of TLBC?</label>
                    <select
                      type="text"
                      className="form-select"
                      name="beAMember"
                      id="beAMember"
                      value={formData.beAMember}
                      onChange={handleChange}
                      placeholder="Select an option"
                      required
                    >
                    <option value="" disabled>Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {error.beAMember && <span className="text-danger">{error.beAMember}</span>}
                  </div>

                  {formData.beAMember === 'Yes' && (
                  <div className="col-md-4">
                    <label htmlFor="department" className="form-label">Department of Interest</label>
                    <select
                      className="form-select"
                      name="department"
                      id="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select a department</option>
                      <option value="Music Team">Music Team</option>
                      <option value="Welcoming Team">Welcoming Team</option>
                      <option value="Decorators">Decorators</option>
                      <option value="Ushering">Ushering</option>
                      <option value="Media">Media</option>
                      <option value="Technicals">Technicals</option>
                      <option value="Stage Management">Stage Management</option>
                      <option value="Venue Management">Venue Management</option>
                      <option value="Protocol">Protocol</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Transport">Transport</option>
                      <option value="Security">Security</option>
                    </select>
                    {error.department && <span className="text-danger">{error.department}</span>}
                  </div>
                  )}
                  <div className="col-md-4">
                    <label htmlFor="maritalStatus" className="form-label">Marital Status</label>
                    <select
                      type="text"
                      className="form-control"
                      name="maritalStatus"
                      id="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      placeholder="Select an option"
                      required
                    >
                     <option value="" disabled>Select an option</option>
                     <option value="Single">Single</option>
                     <option value="Married">Married</option>
                     </select>
                    {error.maritalStatus && <span className="text-danger">{error.maritalStatus}</span>}
                  </div>
                </div>

                <div className="row mb-3">
                <div className="col-md-6">
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
                <div className="col-md-6">
                    <label htmlFor="dateOfComing" className="form-label">Date of coming</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dateOfComing"
                      id="dateOfComing"
                      value={formData.dateOfComing}
                      onChange={handleChange}
                      required
                    />
                    {error.dateOfComing && <span className="text-danger">{error.dateOfComing}</span>}
                  </div>
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
                    
                  />
                  {/* {error.profilePicture && <span className="text-danger">{error.profilePicture}</span>} */}
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

export default FirstTimersForm;
