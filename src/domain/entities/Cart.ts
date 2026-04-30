/**
 * ENTIDADE CART - Carrinho de compras do usuário
 * 
 * Regras de negócio do carrinho:
 * - Um carrinho pertence a um usuário
 * - Pode ter vários itens
 * - Pode ser ativo ou finalizado
 * - Calcula o total automaticamente
 */

export class Cart {
  id: string
  userId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  // Itens do carrinho (carregados sob demanda)
  items: CartItem[]

  constructor(
    props: {
      id?: string
      userId: string
      isActive?: boolean
      items?: CartItem[]
      createdAt?: Date
      updatedAt?: Date
    }
  ) {
    this.id = props.id ?? crypto.randomUUID()
    this.userId = props.userId
    this.isActive = props.isActive ?? true
    this.items = props.items ?? []
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  /**
   * Adiciona um item ao carrinho
   * Regra de negócio: se o item já existe, aumenta a quantidade
   */
  addItem(item: CartItem): void {
    if (!this.isActive) {
      throw new Error('Não é possível adicionar itens a um carrinho finalizado')
    }

    // Verifica se já existe um item com mesmo productId e variationId
    const existingItem = this.items.find(
      (i) =>
        i.productId === item.productId && i.variationId === item.variationId
    )

    if (existingItem) {
      // Se já existe, soma as quantidades
      existingItem.quantity += item.quantity
      existingItem.updatedAt = new Date()
    } else {
      // Se não existe, adiciona novo item
      this.items.push(item)
    }

    this.updatedAt = new Date()
  }

  /**
   * Remove um item do carrinho pelo ID
   */
  removeItem(itemId: string): void {
    if (!this.isActive) {
      throw new Error('Não é possível remover itens de um carrinho finalizado')
    }

    const itemIndex = this.items.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) {
      throw new Error('Item não encontrado no carrinho')
    }

    this.items.splice(itemIndex, 1)
    this.updatedAt = new Date()
  }

  /**
   * Atualiza a quantidade de um item
   * Regra de negócio: quantidade mínima 1, máxima 100
   */
  updateItemQuantity(itemId: string, newQuantity: number): void {
    if (!this.isActive) {
      throw new Error('Não é possível atualizar itens de um carrinho finalizado')
    }

    if (newQuantity < 1 || newQuantity > 100) {
      throw new Error('Quantidade deve ser entre 1 e 100')
    }

    const item = this.items.find((i) => i.id === itemId)
    if (!item) {
      throw new Error('Item não encontrado no carrinho')
    }

    item.quantity = newQuantity
    item.updatedAt = new Date()
    this.updatedAt = new Date()
  }

  /**
   * Limpa todos os itens do carrinho
   */
  clear(): void {
    this.items = []
    this.updatedAt = new Date()
  }

  /**
   * Calcula o total do carrinho
   * Usa o unitPrice (preço no momento da adição) e não o preço atual do produto
   * Regra de negócio: total = soma de (preço unitário × quantidade) de cada item
   */
  getTotal(): number {
    return this.items.reduce((total, item) => {
      return total + item.unitPrice * item.quantity
    }, 0)
  }

  /**
   * Calcula o total dos itens do carrinho (quantidade total)
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  }

  /**
   * Finaliza o carrinho (marca como inativo)
   * Regra de negócio: carrinho finalizado não pode ser editado
   */
  finalize(): void {
    if (this.items.length === 0) {
      throw new Error('Não é possível finalizar um carrinho vazio')
    }
    this.isActive = false
    this.updatedAt = new Date()
  }

  /**
   * Verifica se o carrinho está vazio
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * Busca um item específico no carrinho
   */
  findItem(itemId: string): CartItem | undefined {
    return this.items.find((i) => i.id === itemId)
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      isActive: this.isActive,
      items: this.items.map((item) => item.toObject()),
      total: this.getTotal(),
      totalItems: this.getTotalItems(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  static fromDatabase(
    data: {
      id: string
      userId: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    },
    items: CartItem[] = []
  ): Cart {
    const cart = new Cart({
      id: data.id,
      userId: data.userId,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
    cart.items = items
    return cart
  }
}

/**
 * ENTIDADE CARTITEM - Um item dentro do carrinho
 * 
 * IMPORTANTE: unitPrice é o preço no momento da adição (snapshot)
 * Isso protege o carrinho de mudanças de preço do produto.
 * Ex: Se o produto custa R$50 hoje e amanhã sobe para R$60,
 * o item no carrinho continua com R$50.
 */
export class CartItem {
  id: string
  cartId: string
  productId: string
  variationId: string | null
  quantity: number
  unitPrice: number // Snapshot do preço no momento da adição
  createdAt: Date
  updatedAt: Date

  constructor(
    props: {
      id?: string
      cartId: string
      productId: string
      variationId?: string | null
      quantity: number
      unitPrice: number
      createdAt?: Date
      updatedAt?: Date
    }
  ) {
    this.id = props.id ?? crypto.randomUUID()
    this.cartId = props.cartId
    this.productId = props.productId
    this.variationId = props.variationId ?? null
    this.quantity = props.quantity
    this.unitPrice = props.unitPrice
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  /**
   * Calcula o subtotal deste item (preço × quantidade)
   */
  getSubtotal(): number {
    return this.unitPrice * this.quantity
  }

  /**
   * Formata o subtotal para exibição
   */
  formattedSubtotal(): string {
    return `R$ ${this.getSubtotal().toFixed(2)}`
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      cartId: this.cartId,
      productId: this.productId,
      variationId: this.variationId,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      subtotal: this.getSubtotal(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  static fromDatabase(data: {
    id: string
    cartId: string
    productId: string
    variationId: string | null
    quantity: number
    unitPrice: number
    createdAt: Date
    updatedAt: Date
  }): CartItem {
    return new CartItem({
      id: data.id,
      cartId: data.cartId,
      productId: data.productId,
      variationId: data.variationId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }
}
