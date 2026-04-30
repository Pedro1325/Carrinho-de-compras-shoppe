/**
 * SERVIDOR - Ponto de entrada da aplicação
 * 
 * Este arquivo INICIA o servidor HTTP.
 * Ele importa o app configurado em app.ts e o coloca para ouvir em uma porta.
 * 
 * COMO RODAR:
 * npx tsx src/server.ts
 * 
 * O que acontece quando você roda:
 * 1. Importa o app configurado (rotas, middlewares, etc.)
 * 2. Define a porta (do .env ou 3000 por padrão)
 * 3. Inicia o servidor
 * 4. Mostra mensagem no console
 */

import { app } from '../interfaces/app'

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🛒 Carrinho Shopee - Servidor rodando!          ║
║                                                   ║
║   URL: http://localhost:${PORT}                   ║
║   Health: http://localhost:${PORT}/health          ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `)
})
