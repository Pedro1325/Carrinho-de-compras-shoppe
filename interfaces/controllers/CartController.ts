/**
 * CONTROLLER DE CARRINHO
 * 
 * Gerencia todas as operações do carrinho:
 * - Adicionar item
 * - Remover item
 * - Atualizar quantidade
 * - Ver carrinho
 * - Calcular total (com cupom)
 * - Finalizar carrinho
 * 
 * TODAS as rotas do carrinho requerem autenticação (JWT).
 * O userId vem do req.userId (colocado pelo authMiddleware).
 */

import { Request, Response } from 'express'
import {
  AddToCartUseCase,
  RemoveFromCartUseCase,
  UpdateCartItemQuantityUseCase,
  GetCartUseCase,
  CalculateCartTotalUseCase,
  FinalizeCartUseCase,
} from '../../application/use-cases'
import { addToCartSchema } from '../../shared/validations'
import { AppError } from '../../shared/AppError'

export class CartController {
  constructor(
    private addToCartUseCase: AddToCartUseCase,
    private removeFromCartUseCase: RemoveFromCartUseCase,
    private updateCartItemQuantityUseCase: UpdateCartItemQuantityUseCase,
    private getCartUseCase: GetCartUseCase,
    private calculateCartTotalUseCase: CalculateCartTotalUseCase,
    private finalizeCartUseCase: FinalizeCartUseCase
  ) {}

  /**
   * POST /cart/items - Adicionar item ao carrinho
   */
  async addItem(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw AppError.unauthorized()
    }

    // Converte quantity para número (req.body vem como string)
    const body = req.body
    body.quantity = Number(body.quantity)

    const data = addToCartSchema.parse({
      ...body,
      userId: req.userId,
    })

    const result = await this.addToCartUseCase.execute({
      userId: data.userId,
      productId: data.productId,
      variationId: data.variationId,
      quantity: data.quantity,
    })

    res.status(201).json({
      status: 'success',
      data: result,
    })
  }

  /**
   * DELETE /cart/items/:itemId - Remover item do carrinho
   */
  async removeItem(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw AppError.unauthorized()
    }

    await this.removeFromCartUseCase.execute({
      userId: req.userId,
      itemId: String(req.params.itemId),
    })

    res.status(204).send() // 204 = No Content (sucesso sem retorno)
  }

  /**
   * PUT /cart/items/:itemId - Atualizar quantidade
   */
  async updateItemQuantity(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw AppError.unauthorized()
    }

    const quantity = Number(req.body.quantity)

    const result = await this.updateCartItemQuantityUseCase.execute({
      userId: req.userId,
      itemId: String(req.params.itemId),
      quantity,
    })

    res.json({
      status: 'success',
      data: result,
    })
  }

  /**
   * GET /cart - Obter carrinho do usuário
   */
  async getCart(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw AppError.unauthorized()
    }

    const cart = await this.getCartUseCase.execute({
      userId: req.userId,
    })

    res.json({
      status: 'success',
      data: cart,
    })
  }

  /**
   * POST /cart/total - Calcular total do carrinho (com cupom opcional)
   */
  async calculateTotal(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw AppError.unauthorized()
    }

    const total = await this.calculateCartTotalUseCase.execute({
      userId: req.userId,
      couponCode: req.body.couponCode,
    })

    res.json({
      status: 'success',
      data: total,
    })
  }

  /**
   * POST /cart/finalize - Finalizar carrinho
   */
  async finalize(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw AppError.unauthorized()
    }

    const result = await this.finalizeCartUseCase.execute({
      userId: req.userId,
    })

    res.json({
      status: 'success',
      data: result,
    })
  }
}
