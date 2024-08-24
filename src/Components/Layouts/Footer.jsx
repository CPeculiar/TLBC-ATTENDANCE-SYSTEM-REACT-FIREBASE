import React from 'react'
import { Link } from 'react-router-dom'
import "../Styles/Register.css";

function Footer() {

    const handleFooterLinkClick = (event, url) => {
        event.preventDefault();
        window.scrollTo(0, 0);
        window.location.href = url;
    };

    return (
        <>
            <footer className="site-footer">
                <div className="site-footer-top">
                    <div className="container">
                        <div className="row">

                          

                            <div className="col-lg-6 col-12 d-flex justify-content-lg-start align-items-center">
                                <ul className="social-icon d-flex justify-content-lg-start">
                                    <li className="social-icon-item">
                                        <a href="https://x.com/ElochukwuTLBC" className="social-icon-link" target='_blank'>
                                            <span className="bi-twitter"></span>
                                        </a>
                                    </li>

                                    <li className="social-icon-item">
                                        <a href="https://t.me/TheLordsbrethrenchurchintl" className="social-icon-link" target='_blank'>
                                            <span className="bi-telegram"></span>
                                        </a>
                                    </li>

                                    <li className="social-icon-item">
                                        <a href="https://www.instagram.com/elochukwutlbc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="social-icon-link" target='_blank'>
                                            <span className="bi-instagram"></span>
                                        </a>
                                    </li>

                                    <li className="social-icon-item">
                                        <a href="https://www.youtube.com/@thelordsbrethrenchurchintl" className="social-icon-link" target='_blank'>
                                            <span className="bi-youtube"></span>
                                        </a>
                                    </li>

                                    <li className="social-icon-item">
                                        <a href="https://web.facebook.com/thelordsbrethrenchurchintl" className="social-icon-link" target='_blank'>
                                            <span className="bi-facebook"></span>
                                        </a>
                                    </li>
                                    
                                </ul>
                            </div>
                            
                        </div>
                        
                    </div>
                    
                </div>


                <div className="site-footer-bottom">
                    <div className="container">
                        <p className="text-center text-white pt-4">Copyright © 2024 || TLBC Welcoming Team</p>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer;
