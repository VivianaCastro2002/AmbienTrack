"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import GridTarjetas from "@/components/gridTarjetas"
import { obtenerUltimosValores, TelemetriaAmbiental } from "@/lib/thingsboardApi"
import GraficoGeneral from "@/components/graficoGeneral"
import { Parametro, DatoAmbiental, calcularCondicionGeneral } from "@/utils/parametros"

export default function Dashboard() {
    const searchParams = useSearchParams()
    const salaId = searchParams.get("sala")
    const [valores, setValores] = useState<TelemetriaAmbiental | null>(null)
    const [loading, setLoading] = useState(true)
    const [historial, setHistorial] = useState<Record<Parametro, DatoAmbiental[]>>({
    temperature: [],
    humidity: [],
    light: [],
    noise: [],
    airQuality: [],
    all: [],
    });
    const [rangosIdeales, setRangosIdeales] = useState<Record<Parametro, { min: number; max: number }>>()

  useEffect(() => {
    let intervalo: NodeJS.Timeout
    let deviceId: string | null = null

    const obtenerYActualizarDatos = async () => {
      if (!deviceId) return
      try {
        const datos = await obtenerUltimosValores(deviceId)
        setValores(datos)
        
    const timestamp = new Date().toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    setHistorial((prev) => {
      const nuevoHistorial = { ...prev };

      (Object.keys(datos) as Parametro[]).forEach((param) => {
        if (param !== "all") {
          nuevoHistorial[param] = [
            ...prev[param],
            { hora: timestamp, valor: datos[param] }
          ].slice(-20);
        }
      });

      // Actualizar promedio general (all)
        if (rangosIdeales) {
        const datosSinAll = Object.fromEntries(
        Object.entries(datos).filter(([key]) => key !== "all")
        ) as Record<Parametro, number>;
        const promedioCondicion = calcularCondicionGeneral(datosSinAll, rangosIdeales);
        nuevoHistorial["all"] = [
            ...prev["all"],
            { hora: timestamp, valor: promedioCondicion }
        ].slice(-20);
        }
        console.log("Historial actualizado:", nuevoHistorial["all"]);
      return nuevoHistorial;
    });


      } catch (err) {
        console.error("Error al obtener datos de ThingsBoard:", err)
      } finally {
        setLoading(false)
      }
    }

    const iniciarActualizacion = async () => {
    if (!salaId) return;

    const { data, error } = await supabase
        .from("sala")
        .select(`thingsboard_device_id,parametro_sala (tipo, valor_min, valor_max)`)
        .eq("id", salaId)
        .single();

    if (error || !data?.thingsboard_device_id) {
        console.error("Error al obtener el deviceId:", error);
        setLoading(false);
        return;
    }

    // Convertir los rangos ideales desde la base de datos
    const nuevosRangos: Record<Parametro, { min: number; max: number }> = {
        temperature: { min: 0, max: 0 },
        humidity: { min: 0, max: 0 },
        light: { min: 0, max: 0 },
        noise: { min: 0, max: 0 },
        airQuality: { min: 0, max: 0 },
        all: { min: 0, max: 0 },
    };

    if (data.parametro_sala) {
        for (const p of data.parametro_sala) {
        const tipo = p.tipo as Parametro;
        if (nuevosRangos[tipo]) {
            nuevosRangos[tipo] = {
            min: p.valor_min,
            max: p.valor_max,
            };
        }
        }
    }

    deviceId = data.thingsboard_device_id;
    setRangosIdeales(nuevosRangos);

    
    await obtenerYActualizarDatos(); // primera carga

    intervalo = setInterval(obtenerYActualizarDatos, 3000);
    };


    iniciarActualizacion()

    return () => {
      if (intervalo) clearInterval(intervalo)
    }
  }, [salaId])

  return (
    <main className="items-center min-h-full sm:px-6 sm:py-3">
      <div className="px-6">
        {loading && <p>Cargando datos...</p>}
        {!loading && valores && rangosIdeales && (
        <GridTarjetas valores={valores} rangosIdeales={rangosIdeales} />
        )}
        {!loading && valores && rangosIdeales && (
        <GraficoGeneral
            valores={valores}
            historial={historial}
            setHistorial={setHistorial}
        />
        )}
      </div>
    </main>
  )
}
