// Classe de erro customizada para a aplicação
// Facilita o tratamento de erros no middleware

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message)
  }
}

// TODO: Criar um middleware global para capturar AppError e retornar JSON padronizado
