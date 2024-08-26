import React from 'react'
import { Link } from 'react-router-dom'
import './Tlbc.css'

function Navbar() {
  return (
    <>
        <nav className="navbar navbar-expand-lg bg-dark">
            <div className="container">
                <Link className="navbar-brand" style={{color: 'white', fontSize: '1.6em'}} to={`/`}>
                    TLBC'24
                </Link>
    
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
    
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav align-items-lg-center ms-auto me-lg-5">
                        <li className="nav-item">
                            <Link className="nav-link click-scroll" to={`/tlbc`} >Home</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </>
  )
}

export default Navbar