import apiClient from './axios'

export const getBoletosApi = (params = {}) =>
  apiClient.get('/boletos', {
    params: {
      idReserva: params.idReserva ?? params.id_reserva,
    },
  })

export const getClienteBoletosApi = () =>
  apiClient.get('/portal/cliente/boletos')

export const getClienteReservaBoletosApi = (idReserva) =>
  apiClient.get(`/portal/cliente/reservas/${idReserva}/boleto`)

export const getBoletoApi = (idBoleto) =>
  apiClient.get(`/boletos/${idBoleto}`)
