import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/not_found_page.css';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <img className="not-found-bg" src="/starterpage/videoframe_2453 2.png" alt="Background Error" />
      <div className="not-found-content">
        <div className="not-found-text-group">
          <div className="not-found-title">404</div>
          <div className="not-found-message">
            <div className="not-found-subtitle">OOOPS! WE GONE TOO FAR</div>
            <div className="not-found-desc">No signal here!</div>
          </div>
        </div>
        <div className="not-found-reboot-wrap" onClick={() => navigate('/home')}>
          <div className="not-found-reboot-content">
            {/* If arcticons-simplereboot0.svg is in public folder, just map it. Using a fallback or empty alt if broken */}
            <img className="not-found-reboot-icon" src="/starterpage/arcticons_simplereboot.svg" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div className="not-found-reboot-text">Reboot</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
