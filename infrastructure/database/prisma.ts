/**
 * PRISMA CLIENT SINGLETON
 * 
 * POR QUE usar singleton?
 * - Evitar criar múltiplas conexões com o banco
 * - Uma única instância do PrismaClient é compartilhada por toda a aplicação
 * - Em produção, isso evita "too many connections" no banco
 * 
 * POR QUE não usar import direto do @prisma/client?
 * - Porque @prisma/client é gerado na pasta node_modules
 * - O caminho correto é importar do @prisma/client (já instalado)
 */

import { PrismaClient } from '@prisma/client'

// Variável global para manter a instância única
// Em dev (com hot reload), evita criar múltiplas conexões
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Se já existe uma instância, reutiliza. Senão, cria uma nova.
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Em desenvolvimento, salva a instância no global para reutilizar
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
