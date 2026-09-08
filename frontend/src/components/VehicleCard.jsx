import { useEffect, useState } from "react";
import LazyImage from "./LazyImage.jsx";

export default function VehicleCard({ vehicle }) {
  const photos = vehicle.photos && vehicle.photos.length > 0
    ? vehicle.photos
    : [{ url: vehicle.image_url, thumb: vehicle.thumb_url || vehicle.image_url }];

  const [index, setIndex] = useState(0);

  // Auto-rotate through this vehicle's photos when it has more than one.
  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 3000);
    return () => clearInterval(id);
  }, [photos.length]);

  const current = photos[index];
  const isLocal = current.url?.startsWith("/images/");

  return (
    <article className="vehicle-card">
      <div className="vehicle-photo">
        {isLocal ? (
          <LazyImage
            src={current.url}
            webpSrc={current.url.replace(/\.jpg$/, ".webp")}
            alt={vehicle.name}
          />
        ) : (
          <img src={current.thumb || current.url} alt={vehicle.name} loading="lazy" decoding="async" />
        )}
        {photos.length > 1 && (
          <div className="vehicle-photo-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? "active" : ""}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="vehicle-body">
        <span className="vehicle-category">{vehicle.category}</span>
        <h3>{vehicle.name}</h3>
        <p>{vehicle.description}</p>
      </div>
    </article>
  );
}
