import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAeropuertosApi, getCiudadesApi, getPaisesApi } from '@/api/catalogos.api'

const CACHE_KEY = 'mpas_catalogos_cache'
const CACHE_TTL = 1000 * 60 * 60 * 6

function leerCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function guardarCache(payload) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, timestamp: Date.now() }))
}

function normalizarLista(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.resultados)) return data.resultados
  if (Array.isArray(data?.records)) return data.records
  return []
}

function limpiarNombreCatalogo(nombre = '') {
  return String(nombre).replace(/\d{6,}$/u, '').trim()
}

export const useCatalogosStore = defineStore('catalogos', () => {
  const aeropuertos = ref([])
  const paises = ref([])
  const ciudadesPorPais = ref({})

  const cargandoAeropuertos = ref(false)
  const cargandoPaises = ref(false)

  const opcionesAeropuertos = computed(() =>
    aeropuertos.value.map((a) => {
      const ciudad = a.ciudad ?? a.nombreCiudad ?? a.ciudad_nombre ?? ''
      const pais = a.pais ?? a.nombrePais ?? a.pais_nombre ?? ''
      const codigo = a.codigoIata ?? a.codigo_iata ?? a.iata ?? ''
      const nombre = limpiarNombreCatalogo(a.nombre ?? a.nombreAeropuerto ?? 'Aeropuerto')
      const partes = [codigo, nombre].filter(Boolean)
      const extras = [ciudad, pais].filter(Boolean).join(', ')

      return {
        valor: String(a.idAeropuerto ?? a.id_aeropuerto ?? a.id),
        etiqueta: extras ? `${partes.join(' - ')} (${extras})` : partes.join(' - '),
      }
    }),
  )

  async function cargarAeropuertos(force = false) {
    if (cargandoAeropuertos.value) return
    if (!force && aeropuertos.value.length) return

    const cache = leerCache()
    if (
      !force &&
      cache &&
      Array.isArray(cache.aeropuertos) &&
      Date.now() - (cache.timestamp ?? 0) < CACHE_TTL
    ) {
      aeropuertos.value = cache.aeropuertos
      return
    }

    cargandoAeropuertos.value = true
    try {
      const { data } = await getAeropuertosApi({ estado: 'ACTIVO', page: 1, page_size: 200 })
      aeropuertos.value = normalizarLista(data?.data)
      guardarCache({ aeropuertos: aeropuertos.value })
    } finally {
      cargandoAeropuertos.value = false
    }
  }

  async function cargarPaises(force = false) {
    if (cargandoPaises.value) return
    if (!force && paises.value.length) return

    cargandoPaises.value = true
    try {
      const { data } = await getPaisesApi({ page: 1, page_size: 200 })
      paises.value = normalizarLista(data?.data)
    } finally {
      cargandoPaises.value = false
    }
  }

  async function cargarCiudadesPorPais(idPais, force = false) {
    const key = String(idPais)
    if (!key) return []
    if (!force && ciudadesPorPais.value[key]?.length) {
      return ciudadesPorPais.value[key]
    }

    const { data } = await getCiudadesApi({ id_pais: idPais, page: 1, page_size: 200 })
    const ciudades = normalizarLista(data?.data)
    ciudadesPorPais.value = {
      ...ciudadesPorPais.value,
      [key]: ciudades,
    }
    return ciudades
  }

  return {
    aeropuertos,
    paises,
    ciudadesPorPais,
    cargandoAeropuertos,
    cargandoPaises,
    opcionesAeropuertos,
    cargarAeropuertos,
    cargarPaises,
    cargarCiudadesPorPais,
  }
})
