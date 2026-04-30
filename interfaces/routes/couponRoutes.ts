/**
 * ROTAS DE CUPOM
 * 
 * - POST /coupons - Criar cupom
 * - GET /coupons - Listar todos (admin)
 * - GET /coupons/my - Meus cupons (autenticado)
 */

import { Router } from 'express'
import { CouponController } from '../controllers/CouponController'
import { authMiddleware } from '../middleware/authMiddleware'

export function couponRoutes(couponController: CouponController): Router {
  const router = Router()

  router.post('/coupons', (req, res) => couponController.create(req, res))
  router.get('/coupons/my', authMiddleware, (req, res) => couponController.getMyCoupons(req, res))
  router.get('/coupons', (req, res) => couponController.listAll(req, res))

  return router
}
