"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import GridTarjetas from "@/components/gridTarjetas"
import { obtenerUltimosValores, TelemetriaAmbiental } from "@/lib/thingsboardApi"
import GraficoGeneral from "@/components/graficoGeneral"
import { Parametro, DatoAmbiental, calcularCondicionGeneral, evaluarParametro, NOMBRES_PARAMETROS } from "@/utils/parametros"
import Alertas from "@/components/alertas"
import { estilosPorParametro } from "@/utils/estilosGraficos"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Recomendaciones from "@/components/recomendaciones";
import { recomendacionesPorParametro } from "@/utils/recomendacionesData";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb"
import { getSalaConfig } from "@/utils/storage"


const PARAMETROS: { key: Exclude<Parametro, "all">; label: string }[] = [
  { key: "temperature", label: "Temperatura" },
  { key: "humidity", label: "Humedad" },
  { key: "lux", label: "Luminosidad" },
  { key: "noise", label: "Ruido" },
  { key: "airQuality", label: "Calidad del Aire" }
]

export default function Dashboard() {
  const searchParams = useSearchParams()
  // const salaId = searchParams.get("sala") // Ya no es necesario si solo hay una sala en local

  const [tab, setTab] = useState("general")
  const [loading, setLoading] = useState(true)
  const [valores, setValores] = useState<TelemetriaAmbiental | null>(null)
  const [rangosIdeales, setRangosIdeales] = useState<any>(null)

  // Historial typed correctly
  const [historial, setHistorial] = useState<Record<Parametro, DatoAmbiental[]>>({
    temperature: [],
    humidity: [],
    lux: [],
    noise: [],
    airQuality: [],
    all: []
  })

  const [mensajesAlerta, setMensajesAlerta] = useState<{ mensaje: string; variant: "destructive" | "warning" }[]>([])
  const [recomendaciones, setRecomendaciones] = useState<any[]>([])
  const [salaNombre, setSalaNombre] = useState("")

  // Ref to keep track of interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    cargarDatosSala()

    // Set up polling every 5 seconds
    intervalRef.current = setInterval(() => {
      cargarDatosSala(false) // Pass false to avoid showing loading spinner on updates
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const cargarDatosSala = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      // 1. Cargar configuración de sala desde LocalStorage
      const sala = getSalaConfig()

      if (sala) {
        setSalaNombre(sala.nombre)

        // 2. Cargar parámetros ideales
        const rangos: any = {}
        Object.entries(sala.parametros).forEach(([tipo, p]) => {
          rangos[tipo] = { min: parseFloat(String(p.min)), max: parseFloat(String(p.max)) }
        })
        setRangosIdeales(rangos)

        // 3. Cargar datos de ThingsBoard
        if (sala.accessToken) {
          try {
            const datos = await obtenerUltimosValores(sala.deviceId, sala.accessToken)
            if (datos) {
              setValores(datos)

              // Update historial
              const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

              const datosParaCalculo = Object.fromEntries(
                Object.entries(datos).filter(([key]) => key !== 'timestamp')
              ) as Record<Parametro, number>;

              const condicionGeneral = calcularCondicionGeneral(datosParaCalculo, rangos);

              setHistorial(prev => {
                const nuevo = { ...prev }
                Object.entries(datos).forEach(([key, value]) => {
                  if (key !== 'timestamp' && key in nuevo) {
                    const p = key as Parametro
                    nuevo[p] = [...nuevo[p], { hora, valor: value as number }].slice(-20)
                  }
                })
                nuevo['all'] = [...nuevo['all'], { ...condicionGeneral, hora }].slice(-20)
                return nuevo
              })

              // Generar alertas y recomendaciones
              const nuevasAlertas: any[] = []
              const nuevasRecomendaciones: any[] = []

              Object.entries(datos).forEach(([key, value]) => {
                const tipo = key as Parametro
                if (key === 'timestamp') return

                const rango = rangos[tipo]
                if (rango) {
                  const ticks = estilosPorParametro[tipo].ticks
                  const minGrafico = Math.min(...ticks)
                  const maxGrafico = Math.max(...ticks)

                  const evaluacion = evaluarParametro(value as number, rango.min, rango.max, minGrafico, maxGrafico)

                  if (evaluacion !== 'Normal') {
                    nuevasAlertas.push({
                      mensaje: `${NOMBRES_PARAMETROS[tipo]}: ${evaluacion}`,
                      variant: evaluacion === 'Muy Alta' || evaluacion === 'Muy Baja' ? 'destructive' : 'warning'
                    })

                    // Buscar recomendaciones
                    const recs = recomendacionesPorParametro[tipo]
                    if (recs) {
                      const key = evaluacion.toLowerCase()
                      const recomendacionesEncontradas = recs[key]

                      if (recomendacionesEncontradas && Array.isArray(recomendacionesEncontradas)) {
                        nuevasRecomendaciones.push({
                          titulo: `${NOMBRES_PARAMETROS[tipo]} (${evaluacion})`,
                          acciones: recomendacionesEncontradas,
                          critica: evaluacion === 'Muy Alta' || evaluacion === 'Muy Baja'
                        })
                      }
                    }
                  }
                }
              })
              setMensajesAlerta(nuevasAlertas)
              setRecomendaciones(nuevasRecomendaciones)
            }
          } catch (err) {
            console.error("Error fetching ThingsBoard data:", err)
          }
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/ambientrack/gestion-salas">Configuración</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{salaNombre || "Dashboard"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{salaNombre}</h1>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full px-6">
            <TabsTrigger value="general">Vista General</TabsTrigger>
            <TabsTrigger value="recomendaciones">Recomendaciones</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-6 mt-6">
            {loading && <p>Cargando datos...</p>}
            {!loading && !valores && <p>No hay datos disponibles. Verifica la configuración del dispositivo.</p>}

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
            {mensajesAlerta.map((alerta, idx) => (
              alerta && (
                <Alertas
                  key={idx}
                  mensaje={alerta.mensaje}
                  variant={alerta.variant}
                  onVerRecomendaciones={() => setTab("recomendaciones")}
                />
              )
            ))}
          </TabsContent>
          <TabsContent value="recomendaciones" className="mt-6">
            <Recomendaciones recomendaciones={recomendaciones} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}