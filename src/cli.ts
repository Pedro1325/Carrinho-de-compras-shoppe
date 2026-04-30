import inquirer from 'inquirer'

async function mainMenu() {
  const resposta = await inquirer.prompt([
    {
      type: 'list',
      name: 'menu',
      message: 'Bem vindo ao Carrinho da shoppe, Escolha uma opção',
      choices: ['Ver produtos', 'Ver carrinho', 'Sair']
    }
  ])

  const escolha = resposta.menu

  if (escolha === 'Ver produtos') {
    await mostrarProduto()
  } else if (escolha === 'Ver carrinho') {
    await mostrarCarrinho()
  } else if (escolha === 'Sair') {
    console.log('Saindo do sistema!')
    return
  }

  await mainMenu()
}

async function mostrarProduto() {
  console.log('Mostrando produtos...')
  await mainMenu()
}

async function mostrarCarrinho() {
  console.log('Mostrando carrinho...')
  await mainMenu()
}

mainMenu().catch(console.error)
