/**
 * MIDDLEWARE DE AUTENTICAÇÃO JWT
 * 
 * O que é JWT?
 * JSON Web Token - um token que o usuário recebe após o login
 * e envia em cada requisição subsequente para provar sua identidade.
 * 
 * COMO FUNCIONA:
 * 1. Usuário faz login (email + senha)
 * 2. Servidor verifica e gera um JWT com o userId
 * 3. Usuário envia o JWT no header: Authorization: Bearer <token>
 * 4. Este middleware verifica o token e coloca o userId no req
 * 
 * ESTRUTURA DO JWT:
 * { header: {...}, payload: { userId: "abc123" }, signature: "..." }
 * A signature é criada com uma chave secreta (JWT_SECRET)
 * Se alguém modificar o payload, a signature não bate → token inválido
 */

import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { AppError } from '../../../shared/AppError'

// Estende o Request do Express para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extrai o token do header Authorization
  // Formato esperado: "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw AppError.unauthorized('Token não fornecido')
  }

  // Separa "Bearer" do token
  const [, token] = authHeader.split(' ')

  if (!token) {
    throw AppError.unauthorized('Token não fornecido')
  }

  try {
    // Verifica se o token é válido usando a chave secreta
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret')

    // Se chegou aqui, o token é válido
    // Extrai o userId do payload do token
    req.userId = (decoded as { userId: string }).userId

    // Continua para o próximo middleware/controller
    next()
  } catch {
    throw AppError.unauthorized('Token inválido')
  }
}
