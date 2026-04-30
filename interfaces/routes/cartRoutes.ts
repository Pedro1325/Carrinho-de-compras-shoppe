/**
 * ROTAS DE CARRINHO
 * 
 * TODAS requerem autenticação (authMiddleware).
 * 
 * - POST /cart/items - Adicionar item
 * - PUT /cart/items/:itemId - Atualizar quantidade
 * - DELETE /cart/items/:itemId - Remover item
 * - GET /cart - Ver carrinho
 * - POST /cart/total - Calcular total (com cupom)
 * - POST /cart/finalize - Finalizar carrinho
 */

import { Router } from 'express'
import { CartController } from '../controllers/CartController'
import { authMiddleware } from '../middleware/authMiddleware'

export function cartRoutes(cartController: CartController): Router {
  const router = Router()

  // Todas as rotas de carrinho precisam de autenticação
  router.use(authMiddleware)

  router.get('/cart', (req, res) => cartController.getCart(req, res))
  router.post('/cart/items', (req, res) => cartController.addItem(req, res))
  router.put('/cart/items/:itemId', (req, res) => cartController.updateItemQuantity(req, res))
  router.delete('/cart/items/:itemId', (req, res) => cartController.removeItem(req, res))
  router.post('/cart/total', (req, res) => cartController.calculateTotal(req, res))
  router.post('/cart/finalize', (req, res) => cartController.finalize(req, res))

  return router
}
