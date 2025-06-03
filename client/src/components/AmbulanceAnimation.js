import React, { useState } from 'react';
import '../styles/AmbulanceAnimation.css';
import ambulanceVideo from '../animations/ambulance-animation.mp4'; // Adjust path

function AmbulanceScene() {
    const [isReady, setIsReady] = useState(false);

    return (
        <div className="ambulance-container">
            {!isReady && <div className="video-loader">Loading animation...</div>}

            <video
                src={ambulanceVideo}
                autoPlay
                loop
                muted
                playsInline
                onCanPlay={() => setIsReady(true)}
            />
        </div>
    );
}

export default AmbulanceScene;
