'use client'
import { useState, useEffect, useCallback } from "react";
import GridTarjetas from "@/components/gridTarjetas";
import GraficoGeneral from "@/components/graficoGeneral";
import Alertas from "@/components/alertas";
import { obtenerUltimosValores } from "@/lib/thingsboardApi";
import type { TelemetriaAmbiental } from "@/lib/thingsboardApi";
import { obtenerEstadoParametro, calcularCondicionGeneral, Parametro, DatoAmbiental } from "@/utils/parametros";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Recomendaciones from "@/components/ui/recomendaciones";
import { recomendacionesPorParametro } from "@/utils/recomendacionesData";

const PARAMETROS = [
  { key: "temperature", label: "Temperatura" },
  { key: "humidity", label: "Humedad" },
  { key: "light", label: "Iluminación" },
  { key: "noise", label: "Ruido" },
  { key: "airQuality", label: "Calidad de aire" },
];

export default function Home() {
  const [valores, setValores] = useState<TelemetriaAmbiental>({
    temperature: 0,
    humidity: 0,
    light: 0,
    noise: 0,
    airQuality: 0,
  });

  const [tab, setTab] = useState("general");

  // --- HISTORIAL CENTRALIZADO ---
  function getHistorial(param: Parametro): DatoAmbiental[] {
    if (typeof window === "undefined") return [];
    const raw = sessionStorage.getItem(`historial_${param}`);
    return raw ? JSON.parse(raw) : [];
  }

  const [historial, setHistorial] = useState<Record<Parametro, DatoAmbiental[]>>(() => {
    const inicial: Record<Parametro, DatoAmbiental[]> = {
      temperature: getHistorial("temperature"),
      humidity: getHistorial("humidity"),
      light: getHistorial("light"),
      noise: getHistorial("noise"),
      airQuality: getHistorial("airQuality"),
      all: [],
    };
    return inicial;
  });

  // Actualiza historial cada vez que llegan nuevos valores
  useEffect(() => {
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5);

    setHistorial(prev => {
      const actualizado: Record<Parametro, DatoAmbiental[]> = { ...prev };

      const nuevoValores: Record<Parametro, number> = {
        temperature: valores.temperature ?? 0,
        humidity: valores.humidity ?? 0,
        light: valores.light ?? 0,
        noise: valores.noise ?? 0,
        airQuality: valores.airQuality ?? 0,
        all: 0,
      };

      // Calcula el promedio de estratos para "all"
      const promedioAll = calcularCondicionGeneral(nuevoValores);
      nuevoValores.all = promedioAll;

      (Object.keys(nuevoValores) as Parametro[]).forEach(param => {
        const valor = nuevoValores[param];
        const anterior = prev[param] ?? [];
        const nuevos = [...anterior, { hora, valor }];
        const ultimos = nuevos.length > 10 ? nuevos.slice(-10) : nuevos;
        actualizado[param] = ultimos;

        if (typeof window !== "undefined") {
          sessionStorage.setItem(`historial_${param}`, JSON.stringify(ultimos));
        }
      });
      return actualizado;
    });
  }, [valores]);

  // Fetch de datos
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

  // Función auxiliar para obtener el estado y tipo de alerta
  const getAlerta = useCallback((param: { key: string; label: string }) => {
    const estado = obtenerEstadoParametro(param.key, valores[param.key]);
    const estadoLower = estado.toLowerCase();
    let variant: "advertencia" | "destructiva" = "advertencia";
    if (estadoLower.includes("muy")) variant = "destructiva";
    return {
      mensaje: `${param.label} ${estadoLower}`,
      variant,
      mostrar: estadoLower !== "normal",
    };
  }, [valores]);

  // Función auxiliar para recomendaciones
  const getRecomendacion = useCallback((param: { key: string; label: string }) => {
    const estado = obtenerEstadoParametro(param.key, valores[param.key]).toLowerCase();
    const acciones = recomendacionesPorParametro[param.key]?.[estado];
    if (acciones && acciones.length > 0) {
      return {
        titulo: `${param.label} ${estado}`,
        acciones,
        critica: estado.includes("muy"),
      };
    }
    return null;
  }, [valores]);

  // Arrays finales
  const mensajesAlerta = PARAMETROS.map(getAlerta)
    .filter(alerta => alerta.mostrar)
    .sort((a, b) => (a.variant === "destructiva" ? -1 : 1));

  const recomendaciones = PARAMETROS.map(getRecomendacion).filter(Boolean);

  return (
    <main className="items-center min-h-full sm:px-6 sm:py-3">
      <div className="px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full px-6">
            <TabsTrigger value="general">Vista General</TabsTrigger>
            <TabsTrigger value="recomendaciones">Recomendaciones</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GridTarjetas valores={valores}/>
            <GraficoGeneral
              valores={valores}
              historial={historial}
              setHistorial={setHistorial}
            />
            {mensajesAlerta.map((alerta, idx) => (
              <Alertas
                key={idx}
                mensaje={alerta.mensaje}
                variant={alerta.variant}
                onVerRecomendaciones={() => setTab("recomendaciones")}
              />
            ))}
          </TabsContent>
          <TabsContent value="recomendaciones">
            <Recomendaciones recomendaciones={recomendaciones} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}