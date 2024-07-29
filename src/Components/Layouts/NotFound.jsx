import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div>
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={`/`} >
        <button className="btn btn-primary btn-lg shadow-sm">
                    Click here to go back to Home.
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
