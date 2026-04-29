import { calculateTotal } from './cart.js';
import  createItem from './services/item.js'
const cart = []
const whiteList = []

const item1 = await createItem("Camisa Preta", 30.10, 1)
const item2 = await createItem("Calça azul", 10.10, 2)

await cartService.addItem(myCart, item1)
await cartService.addItem(myCart, item2)

await calculateTotal(myCart)
