import { type } from 'os';
import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
  subtotal: string;
}

type ProductHandle = Omit<ProductFormatted, "price">

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product: Product) => {
    // TODO
    return ({
      id: product.id,
      title: product.title,
      priceFormatted: formatPrice(product.price),
      image: product.image,
      amount: product.amount,
      subtotal: formatPrice(product.price * product.amount),
    })
  })

  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        // TODO
        const { price, amount } = product;
        const totalCalc = price * amount;
        return sumTotal + totalCalc;
      }, 0)
    )

  function handleProductIncrement(product: ProductHandle) {
    const newAmount = product.amount + 1;
    const prodUpdate = {
      productId: product.id,
      amount: newAmount,
    }
    return updateProductAmount(prodUpdate);
  }

  function handleProductDecrement(product: ProductHandle) {
    const newAmount = product.amount - 1;
    const prodUpdate = {
      productId: product.id,
      amount: newAmount,
    }
    return updateProductAmount(prodUpdate);     
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          
          {cartFormatted.map((product) => {
            return (
              <tr data-testid="product" key={product.id}>
              <td>
                <img src={product.image} alt={product.title} />
              </td>
              <td>
                <strong>{product.title}</strong>
                <span>{product.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={product.amount <= 1}
                    onClick={() => handleProductDecrement(product)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={product.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(product)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{product.subtotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
            )
          })}




        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
