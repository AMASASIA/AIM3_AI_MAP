export interface OkeCardData {
  id: string;
  title: string;
  image: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export enum AppRoute {
  HOME = '/',
  OKE = '/oke',
  VOICE = '/voice',
  SETTINGS = '/settings',
  MAP = '/map'
}
