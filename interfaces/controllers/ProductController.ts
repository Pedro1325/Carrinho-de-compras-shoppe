/**
 * CONTROLLER DE PRODUTO
 * 
 * Gerencia requisições HTTP para produtos:
 * - Criar produto
 * - Listar produtos (com filtros)
 */

import { Request, Response } from 'express'
import {
  CreateProductUseCase,
  ListProductsUseCase,
} from '../../application/use-cases'
import { createProductSchema } from '../../shared/validations'

export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private listProductsUseCase: ListProductsUseCase
  ) {}

  /**
   * POST /products - Criar novo produto
   */
  async create(req: Request, res: Response): Promise<void> {
    // Converte campos numéricos da query string (express envia como string)
    const body = req.body
    body.price = Number(body.price)
    body.stock = body.stock !== undefined ? Number(body.stock) : undefined

    const data = createProductSchema.parse(body)

    const product = await this.createProductUseCase.execute({
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      stock: data.stock,
      category: data.category,
    })

    res.status(201).json({
      status: 'success',
      data: product,
    })
  }

  /**
   * GET /products - Listar produtos
   * Query params: ?page=1&limit=20&category=eletronicos&search=iphone
   */
  async list(req: Request, res: Response): Promise<void> {
    const products = await this.listProductsUseCase.execute({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
    })

    res.json({
      status: 'success',
      data: products,
    })
  }
}
