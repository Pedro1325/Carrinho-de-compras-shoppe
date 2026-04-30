/**
 * USE CASE: LISTAR PRODUTOS
 * 
 * FLUXO:
 * 1. Recebe filtros opcionais (categoria, busca, paginação)
 * 2. Busca produtos no banco com os filtros
 * 3. Retorna lista paginada
 */

import { IProductRepository } from '../../src/domain/interfaces/IProductRepository'

type ListProductsRequest = {
  page?: number
  limit?: number
  category?: string
  search?: string
}

type ListProductsResponse = {
  products: Array<{
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    stock: number
    category: string | null
    createdAt: Date
    updatedAt: Date
  }>
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: ListProductsRequest): Promise<ListProductsResponse> {
    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const { products, total } = await this.productRepository.findAll({
      page,
      limit,
      category: data.category,
      search: data.search,
    })

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        stock: p.stock,
        category: p.category,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
