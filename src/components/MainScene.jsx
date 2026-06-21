export default function MainScene() {
  return (
    <div className="main-scene" aria-hidden="true">
      <div className="atmosphere atmosphere-dawn" />
      <div className="atmosphere atmosphere-emerald" />
      <div className="sacred-ring sacred-ring-one" />
      <div className="sacred-ring sacred-ring-two" />
      <div className="orb orb-large" />
      <div className="orb orb-small" />
      <div className="stars">
        {Array.from({ length: 28 }).map((_, index) => (
          <span key={index} style={{ '--i': index }} />
        ))}
      </div>
      <div className="light-particles">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} style={{ '--p': index }} />
        ))}
      </div>
      <div className="mosque-silhouette mosque-back">
        <span className="dome" />
        <span className="minaret minaret-left" />
        <span className="minaret minaret-right" />
      </div>
      <div className="mosque-silhouette mosque-front">
        <span className="dome" />
        <span className="minaret minaret-left" />
        <span className="minaret minaret-right" />
      </div>
    </div>
  );
}
