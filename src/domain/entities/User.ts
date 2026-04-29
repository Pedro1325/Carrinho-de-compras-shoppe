// Entidade de domínio - regras de negócio puras, sem dependências externas
// Aqui você define o que um User é e suas regras (ex: validação de email)

export class User {
  id: number
  uuid: string
  email: string
  senha: string

  constructor(props: { id?: number; uuid: string; email: string; senha: string }) {
    // TODO: Adicionar validações (ex: email válido, senha forte)
    Object.assign(this, props)
  }

  // TODO: Adicionar métodos de domínio se necessário (ex: changePassword)
}
