/**
 * IMPLEMENTAÇÃO DO REPOSITÓRIO DE CUPOM COM PRISMA
 */

import { prisma } from './prisma'
import { ICouponRepository } from '../../src/domain/interfaces/ICouponRepository'
import { Coupon } from '../../src/domain/entities/Coupon'
import { AppError } from '../../shared/AppError'

export class PrismaCouponRepository implements ICouponRepository {
  async create(data: {
    code: string
    discount: number
    isPercentage?: boolean
    expiresAt?: Date | null
    userId?: string | null
  }): Promise<Coupon> {
    // Verifica se código já existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    })
    if (existingCoupon) {
      throw AppError.conflict('Código de cupom já existe')
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discount: data.discount,
        isPercentage: data.isPercentage ?? true,
        expiresAt: data.expiresAt ?? null,
        userId: data.userId ?? null,
        isActive: true,
      },
    })

    return Coupon.fromDatabase(coupon)
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) return null

    return Coupon.fromDatabase(coupon)
  }

  async findById(id: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    })

    if (!coupon) return null

    return Coupon.fromDatabase(coupon)
  }

  async findByUserId(userId: string): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({
      where: {
        OR: [
          { userId }, // Cupons exclusivos do usuário
          { userId: null }, // Cupons públicos
        ],
        isActive: true,
      },
      orderBy: [{ expiresAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
    })

    return coupons.map((c) => Coupon.fromDatabase(c))
  }

  async findAll(): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return coupons.map((c) => Coupon.fromDatabase(c))
  }

  async update(
    id: string,
    data: {
      code?: string
      discount?: number
      isPercentage?: boolean
      expiresAt?: Date | null
      isActive?: boolean
    }
  ): Promise<Coupon> {
    const existingCoupon = await prisma.coupon.findUnique({ where: { id } })
    if (!existingCoupon) {
      throw AppError.notFound('Cupom não encontrado')
    }

    // Se está mudando o código, verifica se o novo código já não está em uso
    if (data.code && data.code !== existingCoupon.code) {
      const codeInUse = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      })
      if (codeInUse) {
        throw AppError.conflict('Código de cupom já existe')
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code.toUpperCase() }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.isPercentage !== undefined && { isPercentage: data.isPercentage }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return Coupon.fromDatabase(coupon)
  }

  async delete(id: string): Promise<void> {
    const existingCoupon = await prisma.coupon.findUnique({ where: { id } })
    if (!existingCoupon) {
      throw AppError.notFound('Cupom não encontrado')
    }

    await prisma.coupon.delete({ where: { id } })
  }
}
