import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

interface AreaMapItem {
  _id?: string;
  title?: string;
  area?: string;
  description?: string;
  imageUrl: string;
}

export default function Maps() {
  const [items, setItems] = useState<AreaMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState<string>("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const q = activeArea ? `?area=${encodeURIComponent(activeArea)}` : "";
      const res = await fetch(`/api/maps${q}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.success === false) throw new Error(data?.error || "Failed to load maps");
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const onUpdate = () => fetchItems();
    window.addEventListener("areaMapsUpdated", onUpdate);
    return () => window.removeEventListener("areaMapsUpdated", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeArea]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => { if (i.area) set.add(i.area); });
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Maps</h1>
        </div>

        {areas.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            <button onClick={()=>setActiveArea("")} className={`px-3 py-1.5 rounded-full text-sm border ${activeArea===""?"bg-[#C70000] text-white border-[#C70000]":"bg-white text-gray-800 border-gray-200"}`}>All</button>
            {areas.map((a)=>(
              <button key={a} onClick={()=>setActiveArea(a)} className={`px-3 py-1.5 rounded-full text-sm border ${activeArea===a?"bg-[#C70000] text-white border-[#C70000]":"bg-white text-gray-800 border-gray-200"}`}>{a}</button>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-600 py-10">Loading maps...</div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center text-gray-600 py-10">No maps found.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it)=> (
            <div key={it._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img src={it.imageUrl} alt={it.title||it.area||"map"} className="w-full h-56 object-cover" />
              <div className="p-3">
                <div className="text-sm text-gray-600">{it.area || "—"}</div>
                <div className="font-semibold text-gray-900">{it.title || "Map"}</div>
                {it.description && (
                  <div className="text-sm text-gray-700 mt-1 line-clamp-3">{it.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
