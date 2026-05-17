import apiClient from './axios'

export const getFacturasApi = (params = {}) =>
  apiClient.get('/facturas', {
    params: {
      page: 1,
      page_size: 100,
      ...params,
    },
  })

export const getClienteFacturasApi = () =>
  apiClient.get('/portal/cliente/facturas')

export const getClienteReservaFacturaApi = (idReserva) =>
  apiClient.get(`/portal/cliente/reservas/${idReserva}/factura`)

export const getFacturaApi = (idFactura) =>
  apiClient.get(`/facturas/${idFactura}`)

export const getFacturaReservaApi = (idReserva) =>
  apiClient.get(`/facturas/reserva/${idReserva}`)

export const anularFacturaApi = (idFactura, payload = {}) =>
  apiClient.patch(`/facturas/${idFactura}/anular`, payload)
