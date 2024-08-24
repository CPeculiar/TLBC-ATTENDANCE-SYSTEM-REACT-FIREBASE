// Profile Component
const Profile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editDetails, setEditDetails] = useState({
      phone: '',
      city: '',
      state: '',
      country: '',
      church: '',
      zone: '',
      cell: '',
      occupation: ''
    });
  
    const [collection, setCollection] = useState("");
    console.log (currentUser);
  
  
    useEffect(() => {
      if (currentUser) {
        const fetchUserDetails = async () => {
           // Try to fetch from the "users" collection first
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
  
          if (!docSnap.exists()) {
            // If not found in "users", check in "FirstTimers"
            docRef = doc(db, "FirstTimers", currentUser.uid);
            docSnap = await getDoc(docRef);
            setCollection("FirstTimers");
          } else {
            setCollection("users");
          }
  
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
            setEditDetails({
              phone: docSnap.data().phone,
              city: docSnap.data().address.city,
              state: docSnap.data().address.state,
              country: docSnap.data().address.country,
              church: docSnap.data().church,
              zone: docSnap.data().zone,
              cell: docSnap.data().cell,
              occupation: docSnap.data().occupation
            });
          } else {
            console.log("No such document!");
          }
        };
  
        fetchUserDetails();
      }
    }, [currentUser]);
  
    const handleEditChange = (e) => {
      setEditDetails({ ...editDetails, [e.target.name]: e.target.value });
    };
  
    const handleSave = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          phone: editDetails.phone,
          address: {
            city: editDetails.city,
            state: editDetails.state,
            country: editDetails.country
          },
          church: editDetails.church,
          zone: editDetails.zone,
          cell: editDetails.cell,
          occupation: editDetails.occupation
        });
        setUserDetails(prevDetails => ({
          ...prevDetails,
          phone: editDetails.phone,
          address: {
            city: editDetails.city,
            state: editDetails.state,
            country: editDetails.country
          },
          church: editDetails.church,
          zone: editDetails.zone,
          cell: editDetails.cell,
          occupation: editDetails.occupation
        }));
        setEditMode(false);
        toggleProfile();
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    };
  
      return (
        <div className="profile-container">
        <div className="profile-picture-container">
          {userDetails?.profilePictureUrl && (
            <img
              src={userDetails.profilePictureUrl}
              alt="Profile"
              className="profile-picture"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '20px'
              }} 
            />
          )}
        </div>
          <h3 style={{textAlign: 'center', color: 'blue', fontWeight: 'bold'}}>Profile Details</h3>
          {editMode ? (
            <div>
              <div className="form-group">
                <label>Phone:</label>
                <input type="text" name="phone" value={editDetails.phone} onChange={handleEditChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>City:</label>
                <input type="text" name="city" value={editDetails.city} onChange={handleEditChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>State:</label>
                <input type="text" name="state" value={editDetails.state} onChange={handleEditChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>Country:</label>
                <input type="text" name="country" value={editDetails.country} onChange={handleEditChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>Church:</label>
                <input type="text" name="church" value={editDetails.church} onChange={handleEditChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>Zone:</label>
                <input type="text" name="zone" value={editDetails.zone} onChange={handleEditChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>Cell:</label>
                <input type="text" name="cell" value={editDetails.cell} onChange={handleEditChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>Occupation:</label>
                <input type="text" name="occupation" value={editDetails.occupation} onChange={handleEditChange} className="form-control"/>
              </div>
              <button onClick={handleSave} className="btn btn-success">Save</button>
            </div>
          ) : (
            <div>
            <p><strong>First Name:</strong> {userDetails?.firstName}</p>
            <p><strong>Last Name:</strong> {userDetails?.lastName}</p>
            <p><strong>Email:</strong> {userDetails?.email}</p>
            <p><strong>Phone:</strong> {userDetails?.phone}</p>
            <p><strong>Date of Birth:</strong> {userDetails?.dateOfBirth}</p>
            <p><strong>City:</strong> {userDetails?.address.city}</p>
            <p><strong>State:</strong> {userDetails?.address.state}</p>
            <p><strong>Country:</strong> {userDetails?.address.country}</p>
            <p><strong>Church:</strong> {userDetails?.church}</p>
            <p><strong>Zone:</strong> {userDetails?.zone}</p>
            <p><strong>Cell:</strong> {userDetails?.cell}</p>
            <p><strong>Occupation:</strong> {userDetails?.occupation}</p>
            <button onClick={() => setEditMode(true)} className="btn btn-primary d-block mx-auto mt-4 w-50">Edit</button>
          </div>
          )}
        </div>
      );
    }
  7
  