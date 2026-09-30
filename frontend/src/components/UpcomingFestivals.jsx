const UpcomingFestivals = ({ festivals = [] }) => {
  if (!festivals.length) {
    return (
      <section className="upcoming-festivals">
        <div className="upcoming-festivals-header">
          <div>
            <span className="section-label">CALENDAR</span>
            <h2>Upcoming Festivals</h2>
            <p>No upcoming festivals found.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="upcoming-festivals">
      <div className="upcoming-festivals-header">
        <div>
          <span className="section-label">CALENDAR</span>
          <h2>Upcoming Festivals</h2>
          <p>Festivals and holidays coming up in the next 7 days.</p>
        </div>

        <span className="festival-count">
          {festivals.length} upcoming
        </span>
      </div>

      <div className="upcoming-festival-list">
        {festivals.map((festival, index) => (
          <div className="upcoming-festival-card" key={festival.id || index}>
            <div className="festival-date-box">
              <span>
                {festival.date
                  ? new Date(festival.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                    })
                  : "--"}
              </span>

              <small>
                {festival.date
                  ? new Date(festival.date).toLocaleDateString("en-IN", {
                      month: "short",
                    })
                  : ""}
              </small>
            </div>

            <div className="upcoming-festival-info">
              <h3>{festival.name || festival.title}</h3>

              <p>
                {festival.description ||
                  festival.message ||
                  "Upcoming festival or holiday."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingFestivals;
