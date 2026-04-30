/**
 * ROTAS DE USUÁRIO
 * 
 * Define os endpoints HTTP relacionados a usuários:
 * - POST /users - Criar conta
 * - POST /users/login - Fazer login
 * - GET /users/me - Ver perfil (requer autenticação)
 */

import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middleware/authMiddleware'

export function userRoutes(userController: UserController): Router {
  const router = Router()

  // Rotas públicas (não precisam de login)
  router.post('/users', (req, res) => userController.create(req, res))
  router.post('/users/login', (req, res) => userController.login(req, res))

  // Rotas protegidas (precisa estar logado)
  router.get('/users/me', authMiddleware, (req, res) => userController.getProfile(req, res))

  return router
}
