import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

export default function AdminTrack() {
  const { awb } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/admin/track/${awb}`, auth());
        setData(res.data);
      } catch {
        alert("Unable to fetch tracking data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [awb]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading tracking…</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-500">Tracking not found</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="border rounded-lg p-4 bg-white">
        <p className="text-sm text-gray-500">AWB</p>
        <p className="font-semibold">{data.awb}</p>

        <div className="flex gap-4 mt-2 text-sm">
          <span>
            <strong>Courier:</strong> {data.courier || "—"}
          </span>
          <span>
            <strong>Status:</strong>{" "}
            <span className="uppercase">{data.current_status}</span>
          </span>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <div className="border-b px-4 py-2 font-semibold text-sm">
          Shipment Events
        </div>

        <div className="divide-y">
          {data.events?.length ? (
            data.events.map((e, i) => (
              <div key={i} className="p-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium uppercase">{e.status}</span>
                  <span className="text-gray-500">
                    {new Date(e.date).toLocaleString()}
                  </span>
                </div>

                {e.location && (
                  <p className="text-gray-600 mt-1">
                    📍 {e.location}
                  </p>
                )}

                {e.message && (
                  <p className="text-gray-500 mt-1">
                    {e.message}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500">
              No tracking updates yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
