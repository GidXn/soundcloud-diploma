import React from 'react';
import "../../styles/footer.css"
import "../../styles/General.css"


import arrow_down from "../../images/icons/arrow_down.png";


const Footer: React.FC = () => {
    return (
        <>
            <footer className="footer_container">
                <div className="relative w-full h-[306px]">


                    {/* контент */}
                    {/* <div className="relative left-0 w-full px-12 flex justify-between text-[24px] z-20">
                        <div className="footer_text_first">
                            <a href="#">Directory</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">About us</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Artist Resources</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Blog</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Help</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Privacy</a>
                        </div>
                        <div className="footer_text_second">
                            Language: English
                            <img src={arrow_down}/>
                        </div>
                    </div> */}
                </div>
            </footer>
        </>
    );
};
export default Footer;