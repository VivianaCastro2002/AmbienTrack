'use client'
import { useState, useEffect } from "react";
import GridTarjetas from "@/components/gridTarjetas";
import GraficoGeneral from "@/components/graficoGeneral";
import Alertas from "@/components/alertas";
import { obtenerUltimosValores } from "@/lib/thingsboardApi";
import type { TelemetriaAmbiental } from "@/lib/thingsboardApi";
import { obtenerEstadoParametro } from "@/utils/simulacionApi";

export default function Home() {

  const [valores, setValores] = useState<TelemetriaAmbiental>({
    temperature: 0,
    humidity: 0,
    light: 0,
    noise: 0,
    airQuality: 0,
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
    const interval = setInterval(fetchDatos, 2000);
    return () => clearInterval(interval);
  }, []);

  const parametros = [
    { key: "temperature", label: "Temperatura" },
    { key: "humidity", label: "Humedad" },
    { key: "light", label: "Iluminación" },
    { key: "noise", label: "Ruido" },
    { key: "airQuality", label: "Calidad de aire" },
  ];

  const mensajesAlerta = parametros.map(param => {
    const estado = obtenerEstadoParametro(param.key, valores[param.key]);
    let variant: "advertencia" | "destructiva" = "advertencia";
    if (estado.toLowerCase().includes("muy")) {
      variant = "destructiva";
    }
    return {
      mensaje: `${param.label} ${estado.toLowerCase()}`,
      variant,
    };
  });;


  return (
    <main className="items-center min-h-full sm:px-6 sm:py-3">
      <div className="px-6">
        <GridTarjetas valores={valores} />
        <GraficoGeneral valores={valores} />
        {mensajesAlerta
          .filter(alerta => !alerta.mensaje.toLowerCase().includes("normal"))
          .map((alerta, idx) => (
            <Alertas key={idx} mensaje={alerta.mensaje} variant={alerta.variant} />
        ))}
      </div>
    </main>
  );
}