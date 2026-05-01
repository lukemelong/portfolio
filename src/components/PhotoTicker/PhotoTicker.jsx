import styles from './PhotoTicker.module.scss';
import { tickerPhotos } from '../../data/photos';

function PhotoTicker() {
  // Doubled list creates a seamless loop with the -50% translate animation.
  const slides = [...tickerPhotos, ...tickerPhotos];

  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {slides.map((photo, index) => (
          <div key={index} className={styles.tile}>
            <img src={photo} alt="" className={styles.image} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoTicker;
