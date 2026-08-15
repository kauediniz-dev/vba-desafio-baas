export interface GatewayLoginUserResponse {
  id: string;
  personType: string;
  name: string;
  tradingName: string;
  email: string;
  document: string;
}

export interface GatewayLoginResponse {
  access_token: string;
  token_type: string;
  codigoCliente: string;
  chaveLoja: string;
  user: GatewayLoginUserResponse;
}
