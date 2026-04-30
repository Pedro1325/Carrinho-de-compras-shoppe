/**
 * ENTIDADE PRODUCT - Representa um produto no sistema
 * 
 * Regras de negócio:
 * - Preço não pode ser negativo ou zero
 * - Estoque não pode ser negativo
 * - Nome é obrigatório
 */

export class Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  category: string | null
  createdAt: Date
  updatedAt: Date

  constructor(
    props: {
      id?: string
      name: string
      description?: string | null
      price: number
      imageUrl?: string | null
      stock?: number
      category?: string | null
      createdAt?: Date
      updatedAt?: Date
    }
  ) {
    this.id = props.id ?? crypto.randomUUID()
    this.name = props.name.trim()
    this.description = props.description ?? null
    this.price = props.price
    this.imageUrl = props.imageUrl ?? null
    this.stock = props.stock ?? 0
    this.category = props.category ?? null
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  /**
   * Valida se o produto está com dados corretos
   */
  isValid(): boolean {
    return (
      this.name.length > 0 &&
      this.price > 0 &&
      this.stock >= 0
    )
  }

  /**
   * Verifica se tem estoque suficiente
   * Regra de negócio: não pode vender mais do que tem em estoque
   */
  hasStock(quantity: number): boolean {
    return this.stock >= quantity
  }

  /**
   * Atualiza o preço do produto
   * Regra de negócio: preço deve ser maior que zero
   */
  updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new Error('Preço deve ser maior que zero')
    }
    this.price = newPrice
    this.updatedAt = new Date()
  }

  /**
   * Atualiza o estoque
   * Regra de negócio: estoque não pode ser negativo
   */
  updateStock(newStock: number): void {
    if (newStock < 0) {
      throw new Error('Estoque não pode ser negativo')
    }
    this.stock = newStock
    this.updatedAt = new Date()
  }

  /**
   * Debita estoque quando um item é adicionado ao carrinho
   * (alguns sistemas reservam estoque no carrinho)
   */
  deductStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error('Estoque insuficiente')
    }
    this.stock -= quantity
    this.updatedAt = new Date()
  }

  /**
   * Repõe estoque quando um item é removido do carrinho
   */
  addStock(quantity: number): void {
    this.stock += quantity
    this.updatedAt = new Date()
  }

  /**
   * Formata o preço para exibição (ex: R$ 29.90)
   */
  formattedPrice(): string {
    return `R$ ${this.price.toFixed(2)}`
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      imageUrl: this.imageUrl,
      stock: this.stock,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  static fromDatabase(data: {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    stock: number
    category: string | null
    createdAt: Date
    updatedAt: Date
  }): Product {
    return new Product({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      stock: data.stock,
      category: data.category,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }
}

/**
 * ENTIDADE PRODUCTVARIATION - Variação de um produto
 * 
 * Exemplo: Produto "Camiseta" tem variações:
 * - "Azul - Tamanho M" (R$50, estoque: 10)
 * - "Vermelha - Tamanho G" (R$55, estoque: 5)
 * 
 * POR QUE ter variações separadas?
 * Porque cada variação pode ter preço e estoque diferentes.
 */
export class ProductVariation {
  id: string
  productId: string
  name: string
  price: number
  stock: number
  createdAt: Date

  constructor(
    props: {
      id?: string
      productId: string
      name: string
      price: number
      stock?: number
      createdAt?: Date
    }
  ) {
    this.id = props.id ?? crypto.randomUUID()
    this.productId = props.productId
    this.name = props.name.trim()
    this.price = props.price
    this.stock = props.stock ?? 0
    this.createdAt = props.createdAt ?? new Date()
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity
  }

  deductStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error('Estoque insuficiente para esta variação')
    }
    this.stock -= quantity
  }

  addStock(quantity: number): void {
    this.stock += quantity
  }

  formattedPrice(): string {
    return `R$ ${this.price.toFixed(2)}`
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      productId: this.productId,
      name: this.name,
      price: this.price,
      stock: this.stock,
      createdAt: this.createdAt,
    }
  }

  static fromDatabase(data: {
    id: string
    productId: string
    name: string
    price: number
    stock: number
    createdAt: Date
  }): ProductVariation {
    return new ProductVariation({
      id: data.id,
      productId: data.productId,
      name: data.name,
      price: data.price,
      stock: data.stock,
      createdAt: data.createdAt,
    })
  }
}
