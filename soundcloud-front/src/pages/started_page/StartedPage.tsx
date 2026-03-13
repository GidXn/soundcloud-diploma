import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/started_page.css';

const StartedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="started-page">
      <div className="header">
        <div className="allure_logo_started">Allure</div>
        <div className="auth_container">
          <div className="log-in" onClick={() => navigate('/login')}>Log in</div>
          <div className="get-started-button" onClick={() => navigate('/signup')}>
            <div className="get-started">Get Started</div>
          </div>
        </div>
      </div>
      <div className="get-started-info">
        <div className="get-started-text">
          <div className="get-started-title">
            <span>
              <span className="get-started-welcome">Welcome to</span>
              {' '} {/* Додає звичайний пробіл */}
              <span className="allure_logo_started2">Allure</span>
            </span>
          </div>
          <div className="get-started-description">
            Allure is your ultimate destination for discovering, streaming, and sharing the best music from around
            the globe. With expertly curated playlists, high-quality audio, and an intuitive design, we connect you to
            the sounds that define your mood. Dive into a world of limitless music and elevate your listening
            experience with Allure.
          </div>
        </div>
        <div className="get-started-button2" onClick={() => navigate('/signup')}>
          <div className="get-started">Get Started</div>
        </div>
      </div>
    </div>
  );
};

export default StartedPage;
