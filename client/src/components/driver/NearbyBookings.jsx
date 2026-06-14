const NearbyBookings = ({ bookings, onSelect }) => {
  if (!bookings || bookings.length === 0) {
    return <div className="bg-white p-4 rounded-xl shadow mt-4">No nearby pending bookings.</div>;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">
      <h3 className="text-lg font-bold text-green-800 mb-2">Nearby Pending Bookings</h3>
      {bookings.map(b => (
        <div key={b.id} className="border-b py-3 flex justify-between items-center">
          <div>
            <div className="font-semibold">{b.service_name}</div>
            <div className="text-sm text-gray-500">{b.address_text} | {b.land_area} acres</div>
            <div className="text-xs text-gray-400">{new Date(b.preferred_date).toLocaleDateString()}</div>
          </div>
          <button
            onClick={() => onSelect(b)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Quote
          </button>
        </div>
      ))}
    </div>
  );
};

export default NearbyBookings;