import { joinClassEvent } from "../services/calendarApi";

export default function JoinTutoringButton({ tutoringId, onJoined }) {
  const handleJoin = async () => {
    try {
      const res = await joinClassEvent(tutoringId);
      console.log("Unido:", res);
      if (onJoined) onJoined(res); 
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <button
      onClick={handleJoin}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Unirme a tutoría
    </button>
  );
}
