import React from 'react'
import { Link } from 'react-router-dom'
import './Tlbc.css'

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

                            <div className="col-lg-6 col-12">
                                <h2 className="text-white mb-lg-0">TLBC'24</h2>
                            </div>

                            <div className="col-lg-6 col-12 d-flex justify-content-lg-end align-items-center">
                                <ul className="social-icon d-flex justify-content-lg-end">
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

                <div className="container">
                    <div className="row">

                        <div className="col-lg-3 col-md-6 col-12 mb-4 mb-lg-0">
                            <h5 className="site-footer-title mb-3">Have any question?</h5>

                            <p className="text-white d-flex mb-1">
                                <a href="tel: 0913-444-5037" className="site-footer-link" style={{textDecoration: 'none'}}>
                                    0913-444-5037
                                </a>
                            </p>

                            <p className="text-white d-flex">
                                <a href="mailto:info@thelordsbrethrenchurch.org" className="site-footer-link" style={{textDecoration: 'none'}}>
                                    info@thelordsbrethrenchurch.org
                                </a>
                            </p>
                        </div>

                        <div className="col-lg-3 col-md-6 col-11 mb-4 mb-lg-0 mb-md-0">
                            <h5 className="site-footer-title mb-3">Location</h5>

                            <p className="text-white d-flex mt-3 mb-2">
                                Kingdom City Prayer Camp, Awka</p>
                        </div>
                    </div>
                </div>

                <div className="site-footer-bottom">
                    <div className="container">
                        <p className="text-center text-white pt-4">Copyright © 2024 || TLBC'24 Planning Team</p>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer;
