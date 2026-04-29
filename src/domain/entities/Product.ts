// Entidade de domínio Product
// Regras: preço não pode ser negativo, etc.

export class Product {
  id: number
  name: string
  price: number
  imageUrl?: string

  constructor(props: { id?: number; name: string; price: number; imageUrl?: string }) {
    // TODO: Validar se price > 0
    Object.assign(this, props)
  }
}
