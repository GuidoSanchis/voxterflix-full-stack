import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  // O token de sessão vive num cookie httpOnly — o navegador o envia sozinho
  // em toda requisição, sem o frontend precisar ler/anexar nada.
  withCredentials: true,
});
