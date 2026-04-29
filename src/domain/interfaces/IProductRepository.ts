// Interface do repositório de Product

export interface IProductRepository {
  create(product: { name: string; price: number; imageUrl?: string }): Promise<any>
  findById(id: number): Promise<any | null>
  findAll(): Promise<any[]>
  // TODO: Adicionar update, delete, busca por filtros
}
