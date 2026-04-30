/**
 * MIDDLEWARE DE TRATAMENTO DE ERROS GLOBAL
 * 
 * POR QUE usar um middleware de erro?
 * - Centraliza o tratamento de erros em um só lugar
 * - Retorna JSON padronizado para o frontend
 * - Não expõe detalhes internos do servidor em produção
 * - Diferencia erros de negócio (AppError) de erros de sistema
 * 
 * COMO FUNCIONA:
 * - O Express detecta um erro em qualquer rota/middleware
 * - Encaminha para este middleware (next(error))
 * - Este middleware decide como responder baseado no tipo de erro
 * 
 * TIPOS DE ERRO TRATADOS:
 * 1. AppError = erros de negócio (ex: "email já cadastrado")
 * 2. ZodError = erros de validação (ex: "campo obrigatório")
 * 3. Erros genéricos = bugs do sistema
 */

import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../../shared/AppError'

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Se é um AppError (erro de negócio), retorna com o statusCode apropriado
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
    })
    return
  }

  // 2. Se é um ZodError (erro de validação), extrai as mensagens de cada campo
  if (error instanceof ZodError) {
    // Transforma array de erros em um objeto mais legível
    // Ex: { email: "Email inválido", password: "Senha muito curta" }
    const messages = error.issues.map((err) => ({
      field: String((err.path as PropertyKey[] | undefined)?.join('.') ?? ''),
      message: String(err.message ?? ''),
    }))

    res.status(422).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Erro de validação',
      details: messages,
    })
    return
  }

  // 3. Erro genérico (bug do sistema)
  // Em produção, NÃO mostrar stack trace (informação sensível)
  // Em desenvolvimento, mostrar para debug
  const isDevelopment = process.env.NODE_ENV !== 'production'

  console.error('Erro interno do servidor:', error)

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: isDevelopment ? error.message : 'Erro interno do servidor',
    ...(isDevelopment && { stack: error.stack }),
  })
}
