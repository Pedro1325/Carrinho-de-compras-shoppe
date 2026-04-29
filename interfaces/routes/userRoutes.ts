// Rotas: Define os endpoints HTTP
// Exemplo usando Express (instale o express primeiro: npm install express @types/express)

import { Router } from 'express'
import { UserController } from '../controllers/UserController'

const router = Router()
const userController = new UserController()

router.post('/users', (req, res) => userController.create(req, res))
// TODO: Adicionar outras rotas (GET /users/:id, etc)

export default router
