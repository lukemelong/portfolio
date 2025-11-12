import React from 'react';

function PhotoTicker() {
  // Array of photos - replace with your actual image paths
  const photos = [
    'images/l-apple.jpg',
    'images/l-camp.jpg',
    'images/l-boat.jpg',
    'images/l-golf.jpeg',
    'images/l-run.jpg',
    'images/l-skate.jpg',
    'images/l-mountain.jpg',
  ];

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      <div style={{
        display: 'flex',
        animation: 'scroll 50s linear infinite',
        width: 'fit-content'
      }}>
        {/* First set of images */}
        {photos.map((photo, index) => (
          <div
            key={`photo-${index}`}
            style={{
              flex: '0 0 auto',
              width: '250px',
              height: '200px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src={photo}
              alt={`Gallery ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {photos.map((photo, index) => (
          <div
            key={`photo-duplicate-${index}`}
            style={{
              flex: '0 0 auto',
              width: '250px',
              height: '200px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src={photo}
              alt={`Gallery ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default PhotoTicker;