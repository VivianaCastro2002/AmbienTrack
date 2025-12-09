export interface ParametroIdeal {
    min: number
    max: number
    unidad: string
}

export interface SalaConfig {
    id: string
    nombre: string
    deviceId: string
    accessToken: string
    parametros: Record<string, ParametroIdeal>
}

const STORAGE_KEY = "ambientrack_sala_config"

export const saveSalaConfig = (config: SalaConfig) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    }
}

export const getSalaConfig = (): SalaConfig | null => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : null
    }
    return null
}
