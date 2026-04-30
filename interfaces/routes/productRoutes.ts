/**
 * ROTAS DE PRODUTO
 * 
 * - POST /products - Criar produto
 * - GET /products - Listar produtos (com filtros)
 */

import { Router } from 'express'
import { ProductController } from '../controllers/ProductController'

export function productRoutes(productController: ProductController): Router {
  const router = Router()

  router.post('/products', (req, res) => productController.create(req, res))
  router.get('/products', (req, res) => productController.list(req, res))

  return router
}
