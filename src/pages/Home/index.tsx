import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart, updateProductAmount } = useCart();
  console.log(cart)

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const { id, amount } = product;
    sumAmount[id] = amount;    
    return sumAmount;

  }, {} as CartItemsAmount)

  // getting all products from API
  useEffect(() => {
    async function loadProducts() {
      const response = await api.get('/products');
      const productsList = await response.data;
      setProducts(productsList)
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    let amountAlready = false;
    // checking if cart has this product already
    for(var i = 0; i < cart.length; i++) {
      if(cart[i].id === id && !amountAlready) {

      // if it has, new amount is sent to useCart
        const newAmount = cart[i].amount + 1;
        const refreshCart = {
          productId: id,
          amount: newAmount,
        }
        updateProductAmount(refreshCart);
        return;
      }
    }
      // if it hasn`t the product in cart, addNewProduct is called
      addProduct(id);
  }

  return (
    <ProductList>
      
      {products.map((product) => {
        product.priceFormatted = formatPrice(product.price)
        
        return (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{product.priceFormatted}</span>

            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id] || 0} 
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        )
      })}


    </ProductList>
  );
};

export default Home;
