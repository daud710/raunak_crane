import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!cancelled) {
        if (error) console.error("Could not load vehicles:", error.message);
        setVehicles(data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { vehicles, loading };
}
