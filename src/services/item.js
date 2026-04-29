// Ações que o item pode fazer
// Calcular o sub-total
async function createItem(name, price, quantity) {
  return {
    name,
    price,
    quantity,
    subtotal: () => price * quantity
  }
}

export default createItem