import React from "react";
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
                        <a href="#">User agreement</a>
                        <a href="#">Legal information</a>
                    </div>
                    <div className="allure-footer-column">
                        <a href="#">To the performers</a>
                        <a href="#">DMCA</a>
                    </div>
                    <div className="allure-footer-column">
                        <a href="#">Privacy Policy</a>
                        <a href="#">PRO Subscription</a>
                    </div>
                    <div className="allure-footer-column">
                        <a href="#">Advertising</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;