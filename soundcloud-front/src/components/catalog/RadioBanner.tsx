import React from "react";

interface RadioBannerProps {
    title: string;
    subtitle: string;
    logo: React.ReactNode;
    variant?: "xit" | "nrj";
}

// Radio station banner from the design (XIT FM on Radio/Top 100, NRJ FM on Artists)
const RadioBanner: React.FC<RadioBannerProps> = ({ title, subtitle, logo, variant = "xit" }) => (
    <div className={`catalog_banner catalog_banner_${variant}`}>
        <div className="catalog_banner_text">
            <div className="catalog_banner_title">{title}</div>
            <div className="catalog_banner_subtitle">{subtitle}</div>
        </div>
        {variant === "nrj" && <div className="catalog_banner_slogan">HIT MUSIC ONLY !</div>}
        <div className="catalog_banner_logo">{logo}</div>
    </div>
);

export const XitLogo: React.FC = () => (
    <div className="catalog_xit_logo">
        <span>XIT</span>
        <span>FM</span>
    </div>
);

export const NrjLogo: React.FC = () => <div className="catalog_nrj_logo">NRJ</div>;

export default RadioBanner;
