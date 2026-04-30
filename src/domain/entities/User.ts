/**
 * ENTIDADE USER - Representa um usuário no sistema
 * 
 * Na Clean Architecture, as ENTIDADES são o centro de tudo:
 * - Não dependem de NENHUMA biblioteca externa (sem Prisma, sem Express, etc.)
 * - Contêm REGRAS DE NEGÓCIO (ex: validar email, senha forte)
 * - São classes puras do TypeScript
 * 
 * POR QUE usar classes e não interfaces?
 * Porque classes podem ter MÉTODOS (comportamento), não só dados.
 * Ex: user.hashPassword(), user.isValidEmail()
 */

export class User {
  id: string
  email: string
  name: string | null
  password: string
  createdAt: Date
  updatedAt: Date

  constructor(
    props: {
      id?: string
      email: string
      name?: string | null
      password: string
      createdAt?: Date
      updatedAt?: Date
    }
  ) {
    // Se não vier id, gera um UUID automaticamente
    this.id = props.id ?? crypto.randomUUID()
    this.email = props.email.toLowerCase().trim()
    this.name = props.name ?? null
    this.password = props.password
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  /**
   * Valida se o email tem formato correto
   * Regra de negócio: todo usuário precisa de um email válido
   */
  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(this.email)
  }

  /**
   * Valida se a senha é forte o suficiente
   * Regra de negócio: senha deve ter pelo menos 6 caracteres,
   * com pelo menos uma letra e um número
   */
  isStrongPassword(): boolean {
    if (this.password.length < 6) return false
    const hasLetter = /[A-Za-z]/.test(this.password)
    const hasNumber = /\d/.test(this.password)
    return hasLetter && hasNumber
  }

  /**
   * Atualiza o nome do usuário
   * Regra de negócio: nome não pode ser vazio
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome não pode ser vazio')
    }
    this.name = name.trim()
    this.updatedAt = new Date()
  }

  /**
   * Atualiza o email do usuário
   * Regra de negócio: email deve ser válido
   */
  updateEmail(email: string): void {
    const newEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      throw new Error('Email inválido')
    }
    this.email = newEmail
    this.updatedAt = new Date()
  }

  /**
   * Converte a entidade para objeto simples (sem métodos)
   * Útil para serializar para JSON ou salvar no banco
   */
  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  /**
   * Cria um User a partir de dados do banco de dados
   * Método estático = pertence à classe, não à instância
   */
  static fromDatabase(data: {
    id: string
    email: string
    name: string | null
    password: string
    createdAt: Date
    updatedAt: Date
  }): User {
    return new User({
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }
}
