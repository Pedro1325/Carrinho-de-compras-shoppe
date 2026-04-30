/**
 * IMPLEMENTAÇÃO DO REPOSITÓRIO DE CARRINHO COM PRISMA
 * 
 * Este repositório é o mais complexo porque:
 * 1. Carrinho tem relação com User e CartItem
 * 2. CartItem tem relação com Product e ProductVariation
 * 3. Precisa calcular totais e gerenciar quantidades
 * 
 * MÉTODO CHAVE: findActiveByUserId
 * - Busca o carrinho ATIVO do usuário
 * - Inclui os items com dados do produto e variação
 */

import { prisma } from './prisma'
import { ICartRepository } from '../../src/domain/interfaces/ICartRepository'
import { Cart, CartItem } from '../../src/domain/entities/Cart'
import { AppError } from '../../shared/AppError'

export class PrismaCartRepository implements ICartRepository {
  async create(userId: string): Promise<Cart> {
    // Verifica se usuário já tem um carrinho ativo
    const existingCart = await this.findActiveByUserId(userId)
    if (existingCart) {
      return existingCart // Retorna o carrinho existente (não cria duplicado)
    }

    const cart = await prisma.cart.create({
      data: {
        userId,
        isActive: true,
      },
    })

    return Cart.fromDatabase(cart)
  }

  async findActiveByUserId(userId: string): Promise<Cart | null> {
    // Busca carrinho ativo do usuário com todos os items
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        items: {
          include: {
            product: true, // Inclui dados do produto
            variation: true, // Inclui dados da variação (se houver)
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!cart) return null

    // Converte CartItem do Prisma para entidade
    const items = cart.items.map((item) =>
      CartItem.fromDatabase({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )

    return Cart.fromDatabase(cart, items)
  }

  async findById(id: string): Promise<Cart | null> {
    const cart = await prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variation: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!cart) return null

    const items = cart.items.map((item) =>
      CartItem.fromDatabase({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )

    return Cart.fromDatabase(cart, items)
  }

  async findAllByUserId(userId: string): Promise<Cart[]> {
    const carts = await prisma.cart.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variation: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return carts.map((cart) => {
      const items = cart.items.map((item) =>
        CartItem.fromDatabase({
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          variationId: item.variationId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })
      )
      return Cart.fromDatabase(cart, items)
    })
  }

  // ====== OPERAÇÕES COM ITENS ======

  async addItem(
    cartId: string,
    data: {
      productId: string
      variationId?: string | null
      quantity: number
      unitPrice: number
    }
  ): Promise<CartItem> {
    // Verifica se carrinho existe e está ativo
    const cart = await prisma.cart.findUnique({ where: { id: cartId } })
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }
    if (!cart.isActive) {
      throw AppError.validation('Não é possível adicionar itens a um carrinho finalizado')
    }

    // Verifica se já existe um item igual no carrinho (mesmo produto + variação)
    const where: Record<string, unknown> = {
      cartId,
      productId: data.productId,
    }
    if (data.variationId) {
      where.variationId = data.variationId
    } else {
      where.variationId = null
    }

    const existingItem = await prisma.cartItem.findFirst({ where })

    if (existingItem) {
      // Se já existe, atualiza a quantidade
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
        },
      })

      return CartItem.fromDatabase(updated)
    }

    // Se não existe, cria novo item
    const item = await prisma.cartItem.create({
      data: {
        cartId,
        productId: data.productId,
        variationId: data.variationId ?? null,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
      },
    })

    return CartItem.fromDatabase(item)
  }

  async findItemById(cartId: string, itemId: string): Promise<CartItem | null> {
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    })

    if (!item) return null

    return CartItem.fromDatabase(item)
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<CartItem> {
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    })
    if (!item) {
      throw AppError.notFound('Item não encontrado no carrinho')
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    })

    return CartItem.fromDatabase(updated)
  }

  async removeItem(cartId: string, itemId: string): Promise<void> {
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    })
    if (!item) {
      throw AppError.notFound('Item não encontrado no carrinho')
    }

    await prisma.cartItem.delete({ where: { id: item.id } })
  }

  async clearItems(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { cartId } })
  }

  // ====== OPERAÇÕES DO CARRINHO ======

  async finalize(cartId: string): Promise<Cart> {
    const cart = await prisma.cart.findUnique({ where: { id: cartId } })
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }
    if (!cart.isActive) {
      throw AppError.validation('Carrinho já foi finalizado')
    }

    // Verifica se carrinho tem items
    const itemCount = await prisma.cartItem.count({ where: { cartId } })
    if (itemCount === 0) {
      throw AppError.validation('Não é possível finalizar um carrinho vazio')
    }

    const updated = await prisma.cart.update({
      where: { id: cartId },
      data: { isActive: false },
      include: {
        items: {
          include: {
            product: true,
            variation: true,
          },
        },
      },
    })

    const items = updated.items.map((item) =>
      CartItem.fromDatabase({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )

    return Cart.fromDatabase(updated, items)
  }

  async calculateTotal(cartId: string): Promise<number> {
    const items = await prisma.cartItem.findMany({
      where: { cartId },
      select: {
        unitPrice: true,
        quantity: true,
      },
    })

    return items.reduce((total, item) => {
      return total + item.unitPrice * item.quantity
    }, 0)
  }

  async delete(cartId: string): Promise<void> {
    const cart = await prisma.cart.findUnique({ where: { id: cartId } })
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }

    // Prisma vai deletar os items automaticamente por causa do onDelete: Cascade
    await prisma.cart.delete({ where: { id: cartId } })
  }
}
