/**
 * USE CASE: CRIAR PRODUTO
 * 
 * FLUXO:
 * 1. Valida dados de entrada
 * 2. Cria o produto no banco
 * 3. Retorna o produto criado
 */

import { IProductRepository } from '../../src/domain/interfaces/IProductRepository'
import { AppError } from '../../../shared/AppError'

type CreateProductRequest = {
  name: string
  description?: string
  price: number
  imageUrl?: string
  stock?: number
  category?: string
}

type CreateProductResponse = {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  category: string | null
  createdAt: Date
  updatedAt: Date
}

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductRequest): Promise<CreateProductResponse> {
    // Validações básicas
    if (data.price <= 0) {
      throw AppError.validation('Preço deve ser maior que zero')
    }

    if ((data.stock ?? 0) < 0) {
      throw AppError.validation('Estoque não pode ser negativo')
    }

    const product = await this.productRepository.create({
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      imageUrl: data.imageUrl ?? null,
      stock: data.stock ?? 0,
      category: data.category ?? null,
    })

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
