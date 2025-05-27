// rls-app/shared/config/appwrite.ts

import { Client, Databases, Storage, Account, ID } from 'appwrite'; // <-- Adicione ID aqui!

// DEFINIR E EXPORTAR O PROJECT_ID AQUI
export const PROJECT_ID = '68349d71002af2559722';

export const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

// EXPORTAR ID AQUI!
export { ID }; // <-- Exporte ID aqui!

// Note: Messaging service will be configured when needed for push notifications
// Não há um Messaging service instanciado e exportado aqui

// IDs das Collections
export const DATABASE_ID = '6834b47a002f204dca22';
export const COLLECTIONS = {
  USERS: 'users',
  EXPENSES: 'expenses',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications'
};

// IDs do Storage e Messaging
export const BUCKET_ID = '6834c7060000f37d5d65';
export const TOPICS = {
  EMAIL: '6834cb20000a7b82e819',
  PUSH: '6834cacb002ef36fb148'
};

// API Key (apenas para server-side - NUNCA no frontend)
export const API_KEY = 'standard_33f3587568f7c96782477cb3e39807f614662968221508267e9a17c8be00ca3133ffaaf2a6f222bf2d9d589a54db802d5d14ccd0116bbad471cc96e2a7c814ac4df94bd7fd85939f68a25936a3fb35f03157e745c445d491c6eece2a1f662e96360b8c22607a9f4effc2755c92aeb1ff31b71ba358815f7990796379357844ed';