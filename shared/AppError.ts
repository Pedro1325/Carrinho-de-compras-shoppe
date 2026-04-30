/**
 * CLASSE DE ERRO CUSTOMIZADA
 * 
 * POR QUE criar uma classe de erro customizada?
 * - Diferenciar erros de negócio de erros de sistema
 * - Incluir statusCode para respostas HTTP automáticas
 * - Facilitar o tratamento no middleware de erro global
 * 
 * EXEMPLO DE USO:
 * throw new AppError('Usuário não encontrado', 404)
 * throw new AppError('Email já cadastrado', 409)
 */

export class AppError extends Error {
  public statusCode: number
  public code: string // Código interno para o frontend identificar o erro

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = 'BAD_REQUEST'
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code

    // Mantém o stack trace correto (para debug)
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * Método estático para criar erros comuns rapidamente
   */
  static notFound(message: string): AppError {
    return new AppError(message, 404, 'NOT_FOUND')
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, 'CONFLICT')
  }

  static unauthorized(message: string = 'Não autorizado'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message: string = 'Acesso negado'): AppError {
    return new AppError(message, 403, 'FORBIDDEN')
  }

  static validation(message: string): AppError {
    return new AppError(message, 422, 'VALIDATION_ERROR')
  }
}
