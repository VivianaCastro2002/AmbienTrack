'use client'
import { useState, useEffect } from "react";
import GridTarjetas from "@/components/gridTarjetas";
import GraficoGeneral from "@/components/graficoGeneral";
import { obtenerUltimosValores } from "@/lib/thingsboardApi";
import type { TelemetriaAmbiental } from "@/lib/thingsboardApi";

export default function Home() {
  const [valores, setValores] = useState<TelemetriaAmbiental>({
    temperature: 0,
    humidity: 0,
    light: 0,
    noise: 0,
  });

  useEffect(() => {
    async function fetchDatos() {
      try {
        const reales = await obtenerUltimosValores();
        setValores(reales);
      } catch (error) {
        console.error("Error al obtener datos desde ThingsBoard:", error);
      }
    }
    fetchDatos();
    const interval = setInterval(fetchDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="items-center min-h-full sm:px-6 sm:py-3">
      <main className="px-6">
        <GridTarjetas valores={valores} />
        <GraficoGeneral valores={valores} />
      </main>
    </div>
  );
}