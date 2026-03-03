
import '../../styles/General.css';
import '../../styles/login_signup/header.css';
import {useNavigate} from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="hidden lg:block mx-auto max-w-screen-full-xl">
                <header>
                    <div className="header_container">
                        <div className="header_logo">
                            <div className="w-[56px] h-[56px] xl:mr-[12px] lg:mr-[12px]">
                                <img src="/logo_Allurew.png" alt="logo"/>
                            </div>
                        </div>
                            <div className="header_buttons">
                                <button className="header_button_sign_up baloo2 text-white text-[20px] font-bold"
                                    onClick={() => navigate('/login')}
                                >Sign in
                                </button>
                                <button className="header_button_create_account baloo2 text-white text-[20px] font-bold"
                                        onClick={() => navigate('/signup')}
                                >Create account
                                </button>
                            </div>
                    </div>
                </header>
            </div>
        </>
    );
};
export default Header;
