// web-admin/src/services/appwrite.ts - CONFIGURAÇÃO REAL APPWRITE

import {
  client,
  account,
  databases,
  storage,
  // messaging, // <<< REMOVIDO: Não exportado de shared/config/appwrite.ts
  PROJECT_ID, // <<< AGORA IMPORTADO CORRETAMENTE
  DATABASE_ID,
  BUCKET_ID
} from '../../../shared/config/appwrite';

// Re-export configurações do shared
export {
  client,
  account,
  databases,
  storage,
  // messaging, // <<< REMOVIDO: Não exportado de shared/config/appwrite.ts
  PROJECT_ID, // <<< AGORA EXPORTADO CORRETAMENTE
  DATABASE_ID,
  BUCKET_ID
};

// Verificar conexão com Appwrite na inicialização
export const initializeAppwrite = async () => {
  try {
    console.log('🚀 Initializing Appwrite connection...');
    console.log('📍 Endpoint:', client.config.endpoint);
    console.log('🆔 Project ID:', PROJECT_ID);
    console.log('🗄️ Database ID:', DATABASE_ID);
    console.log('📁 Bucket ID:', BUCKET_ID);

    // Testar conexão fazendo uma chamada básica
    const health = await fetch(`${client.config.endpoint}/health`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
      },
    });

    if (health.ok) {
      console.log('✅ Appwrite server is healthy');

      // Verificar se conseguimos acessar o banco de dados
      try {
        // 'users' é o ID da coleção, não a string literal 'users' se for uma constante
        // Certifique-se de que COLLECTIONS.USERS está sendo usado aqui se for o caso
        await databases.listDocuments(DATABASE_ID, 'users', []); // Assumindo 'users' é o ID da coleção
        console.log('✅ Database connection successful');
      } catch (dbError: any) {
        if (dbError.code === 401) {
          console.log('🔓 Database requires authentication (expected)');
        } else {
          console.warn('⚠️ Database connection issue:', dbError.message);
        }
      }

      return { success: true, message: 'Appwrite initialized successfully' };
    } else {
      throw new Error(`Server health check failed: ${health.status}`);
    }
  } catch (error: any) {
    console.error('❌ Appwrite initialization failed:', error);
    return {
      success: false,
      error: error.message,
      endpoint: client.config.endpoint,
      projectId: PROJECT_ID
    };
  }
};

// Verificar se usuário está autenticado
export const checkAppwriteAuth = async () => {
  try {
    const user = await account.get();
    console.log('✅ User is authenticated:', user.email);
    return { authenticated: true, user };
  } catch (error: any) {
    if (error.code === 401) {
      console.log('🔓 User not authenticated (expected)');
      return { authenticated: false, error: 'Not authenticated' };
    } else {
      console.error('❌ Auth check error:', error);
      return { authenticated: false, error: error.message };
    }
  }
};

// Log das configurações para debug
console.log('⚙️ Appwrite Configuration:');
console.log('📍 Endpoint:', client.config.endpoint);
console.log('🆔 Project:', PROJECT_ID);
console.log('🗄️ Database:', DATABASE_ID);
console.log('📁 Bucket:', BUCKET_ID);

// Inicializar automaticamente quando o módulo for carregado
if (typeof window !== 'undefined') {
  initializeAppwrite().then(result => {
    if (result.success) {
      console.log('🎉 Appwrite ready for use!');
    } else {
      console.error('💥 Appwrite initialization failed. Check configuration.');
      console.error('🔧 Debug info:', {
        endpoint: result.endpoint,
        projectId: result.projectId,
        error: result.error
      });
    }
  });
}