/**
 * CONTROLLER DE CUPOM
 * 
 * Gerencia cupons de desconto:
 * - Criar cupom (admin)
 * - Listar cupons do usuário
 */

import { Request, Response } from 'express'
import { CreateCouponUseCase } from '../../application/use-cases'
import { ICouponRepository } from '../../src/domain/interfaces/ICouponRepository'
import { createCouponSchema } from '../../shared/validations'
import { AppError } from '../../shared/AppError'

export class CouponController {
  constructor(
    private createCouponUseCase: CreateCouponUseCase,
    private couponRepository: ICouponRepository
  ) {}

  /**
   * POST /coupons - Criar cupom (rota administrativa)
   */
  async create(req: Request, res: Response): Promise<void> {
    const body = req.body
    body.discount = Number(body.discount)

    const data = createCouponSchema.parse(body)

    const coupon = await this.createCouponUseCase.execute({
      code: data.code,
      discount: data.discount,
      isPercentage: data.isPercentage,
      expiresAt: data.expiresAt,
      userId: data.userId,
    })

    res.status(201).json({
      status: 'success',
      data: coupon,
    })
  }

  /**
   * GET /coupons/my - Listar cupons disponíveis para o usuário logado
   */
  async getMyCoupons(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw AppError.unauthorized()
    }

    const coupons = await this.couponRepository.findByUserId(req.userId)

    res.json({
      status: 'success',
      data: coupons.map((c) => c.toObject()),
    })
  }

  /**
   * GET /coupons - Listar todos os cupons (admin)
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const coupons = await this.couponRepository.findAll()

    res.json({
      status: 'success',
      data: coupons.map((c) => c.toObject()),
    })
  }
}
