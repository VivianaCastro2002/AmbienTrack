'use client'
import { useState, useEffect } from "react"
import TarjetaEstado from "@/components/tarjetaEstado";
import { Thermometer, Droplets, Lightbulb, Volume2, Wind } from "lucide-react";
import { obtenerUltimosValores } from "@/lib/thingsboardApi" // nueva API real
import { obtenerEstadoParametro, Parametro } from "@/utils/simulacionApi";

export default function GridTarjetas(){
  const parametros = [
    { key: "temperature",  title: "Temperatura", icon:<Thermometer className="w-5 h-5"/>, unidad: "°" },
    { key: "humidity", title: "Humedad", icon:<Droplets className="w-5 h-5"/>, unidad: "%" },
    { key: "light", title: "Iluminación", icon:<Lightbulb className="w-5 h-5"/>, unidad: "lux" },
    { key: "noise", title: "Ruido", icon:<Volume2 className="w-5 h-5"/>, unidad: "dB" },
    { key: "airQuality", title: "Calidad de Aire", icon:<Wind className="w-5 h-5"/>, unidad: "AQ" },
  ];

  const [valores, setValores] = useState<Record<Parametro, number>>({
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
        setValores((prev) => ({
          ...prev,
          ...reales,
        }))
      } catch (error) {
        console.error("Error al obtener datos desde ThingsBoard:", error);
      }
    }

    fetchDatos();
    const interval = setInterval(fetchDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  return(
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pb-3">
      {parametros.map((param)=> {
        const valorActual = valores[param.key as Parametro];
        const estadoActual = obtenerEstadoParametro(param.key as Parametro, valorActual);

        return(
          <TarjetaEstado
            key={param.key}
            title={param.title}
            icon={param.icon}
            valor={`${valorActual}${param.unidad}`}
            estado={estadoActual}
          />
        );  
      })}
    </div>
  )
}
