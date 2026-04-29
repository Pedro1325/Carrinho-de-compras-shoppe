// Interface (contrato) do repositório de User
// Seguindo o princípio de Inversão de Dependência (D do SOLID)
// A camada de aplicação depende dessa interface, não da implementação do Prisma

export interface IUserRepository {
  create(user: { uuid: string; email: string; senha: string }): Promise<any>
  findByEmail(email: string): Promise<any | null>
  findById(id: number): Promise<any | null>
  // TODO: Adicionar outros métodos conforme necessário (update, delete)
}
