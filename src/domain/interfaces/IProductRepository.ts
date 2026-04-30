/**
 * INTERFACE DO REPOSITÓRIO DE PRODUTO
 * 
 * Define todas as operações que o use case pode fazer com produtos.
 */

import { Product, ProductVariation } from '../entities/Product'

export interface IProductRepository {
  // Cria um novo produto
  create(product: {
    name: string
    description?: string | null
    price: number
    imageUrl?: string | null
    stock?: number
    category?: string | null
  }): Promise<Product>

  // Busca produto por ID
  findById(id: string): Promise<Product | null>

  // Lista todos os produtos (com filtros opcionais)
  findAll(options?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }): Promise<{ products: Product[]; total: number }>

  // Atualiza dados de um produto
  update(id: string, data: {
    name?: string
    description?: string | null
    price?: number
    imageUrl?: string | null
    stock?: number
    category?: string | null
  }): Promise<Product>

  // Deleta um produto
  delete(id: string): Promise<void>

  // ====== VARIAÇÕES DE PRODUTO ======

  // Cria uma variação para um produto
  createVariation(variation: {
    productId: string
    name: string
    price: number
    stock?: number
  }): Promise<ProductVariation>

  // Busca variação por ID
  findVariationById(id: string): Promise<ProductVariation | null>

  // Lista todas as variações de um produto
  findVariationsByProductId(productId: string): Promise<ProductVariation[]>

  // Atualiza uma variação
  updateVariation(id: string, data: {
    name?: string
    price?: number
    stock?: number
  }): Promise<ProductVariation>

  // Deleta uma variação
  deleteVariation(id: string): Promise<void>
}
