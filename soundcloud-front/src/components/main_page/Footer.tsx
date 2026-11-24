import React from "react";
import { Link } from "react-router-dom";
import "../../styles/footer.css";
import "../../styles/General.css";

const Footer: React.FC = () => {
    return (
        <footer className="footer_container allure-footer">
            <div className="allure-footer-inner">
                <div className="allure-footer-copy">
                    <p>© 2026 Music online platform “Allure”.</p>
                    <p>
                        The service may contain content that is not intended for minors.
                    </p>
                </div>

                <div className="allure-footer-divider" />

                <div className="allure-footer-links-row">
                    <div className="allure-footer-column">
                        <Link to="/support/user-agreement">User agreement</Link>
                        <Link to="/support/rights-holders">Legal information</Link>
                    </div>
                    <div className="allure-footer-column">
                        <Link to="/support/performers">To the performers</Link>
                        <Link to="/support/dmca">DMCA</Link>
                    </div>
                    <div className="allure-footer-column">
                        <Link to="/support/privacy-policy">Privacy Policy</Link>
                        <Link to="/support/pro-subscription">PRO Subscription</Link>
                    </div>
                    <div className="allure-footer-column">
                        <Link to="/support/advertising">Advertising</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;