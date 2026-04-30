/**
 * IMPLEMENTAÇÃO DO REPOSITÓRIO DE PRODUTO COM PRISMA
 * 
 * Inclui operações para produtos E variações de produto.
 * Cada método converte dados do Prisma para entidades de domínio.
 */

import { prisma } from './prisma'
import { IProductRepository } from '../../src/domain/interfaces/IProductRepository'
import { Product, ProductVariation } from '../../src/domain/entities/Product'
import { AppError } from '../../shared/AppError'

export class PrismaProductRepository implements IProductRepository {
  async create(data: {
    name: string
    description?: string | null
    price: number
    imageUrl?: string | null
    stock?: number
    category?: string | null
  }): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        imageUrl: data.imageUrl ?? null,
        stock: data.stock ?? 0,
        category: data.category ?? null,
      },
    })

    return Product.fromDatabase(product)
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variations: true, // Inclui variações do produto
      },
    })

    if (!product) return null

    return Product.fromDatabase(product)
  }

  async findAll(options?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }): Promise<{ products: Product[]; total: number }> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 20
    const skip = (page - 1) * limit

    // Constrói filtros dinamicamente
    const where: Record<string, unknown> = {}

    if (options?.category) {
      where.category = options.category
    }

    if (options?.search) {
      // Busca por nome OU descrição (case insensitive)
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variations: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products: products.map((p) => Product.fromDatabase(p)),
      total,
    }
  }

  async update(
    id: string,
    data: {
      name?: string
      description?: string | null
      price?: number
      imageUrl?: string | null
      stock?: number
      category?: string | null
    }
  ): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      throw AppError.notFound('Produto não encontrado')
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.category !== undefined && { category: data.category }),
      },
    })

    return Product.fromDatabase(product)
  }

  async delete(id: string): Promise<void> {
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      throw AppError.notFound('Produto não encontrado')
    }

    await prisma.product.delete({ where: { id } })
  }

  // ====== VARIAÇÕES ======

  async createVariation(data: {
    productId: string
    name: string
    price: number
    stock?: number
  }): Promise<ProductVariation> {
    // Verifica se produto existe
    const product = await prisma.product.findUnique({ where: { id: data.productId } })
    if (!product) {
      throw AppError.notFound('Produto não encontrado')
    }

    const variation = await prisma.productVariation.create({
      data: {
        productId: data.productId,
        name: data.name,
        price: data.price,
        stock: data.stock ?? 0,
      },
    })

    return ProductVariation.fromDatabase(variation)
  }

  async findVariationById(id: string): Promise<ProductVariation | null> {
    const variation = await prisma.productVariation.findUnique({
      where: { id },
    })

    if (!variation) return null

    return ProductVariation.fromDatabase(variation)
  }

  async findVariationsByProductId(productId: string): Promise<ProductVariation[]> {
    const variations = await prisma.productVariation.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    })

    return variations.map((v) => ProductVariation.fromDatabase(v))
  }

  async updateVariation(
    id: string,
    data: { name?: string; price?: number; stock?: number }
  ): Promise<ProductVariation> {
    const existingVariation = await prisma.productVariation.findUnique({
      where: { id },
    })
    if (!existingVariation) {
      throw AppError.notFound('Variação não encontrada')
    }

    const variation = await prisma.productVariation.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
      },
    })

    return ProductVariation.fromDatabase(variation)
  }

  async deleteVariation(id: string): Promise<void> {
    const existingVariation = await prisma.productVariation.findUnique({
      where: { id },
    })
    if (!existingVariation) {
      throw AppError.notFound('Variação não encontrada')
    }

    await prisma.productVariation.delete({ where: { id } })
  }
}
