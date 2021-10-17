import { createContext, ReactNode, useContext, useState } from 'react';
import { toast, ToastContent } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

import { AxiosError } from 'axios';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void | ToastContent>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}


const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
  

  const addProduct = async (productId: number) => {
    try {      
      // if product doesn't exist in stock
      let stock = null;
      let productData = null;
      try {
        stock = await api.get(`/stock/${productId}`);
        productData = await api.get(`/products/${productId}`)
      } catch(err) {
        throw 'Erro na adição do produto'
      }
      
      // if product is already in cart, only add its amount
      let checkIfIsInCart = cart.findIndex((product) => product.id === productId);
      if(checkIfIsInCart > -1) {
        if(cart[checkIfIsInCart].amount < stock.data.amount) {
          let newCart = cart;
          newCart[checkIfIsInCart].amount += 1;
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
          setCart([...newCart]);
          return;
        } else {
          throw 'Quantidade solicitada fora de estoque'
        }
      }

      if(cart.length > 0) {
      
        let newProdInCart: Product = {
          id: productId,
          title: productData.data.title as string,
          price: productData.data.price as number,
          image: productData.data.image as string,
          amount: 1,
        }

        const cartAfter = [...cart, newProdInCart];
  
        await localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartAfter));
        setCart(cartAfter);

      } else {
        let openingCart: Product[] = [{
          id: productId,
          title: productData.data.title as string,
          price: productData.data.price as number,
          image: productData.data.image as string,
          amount: 1,
        }]
        await localStorage.setItem('@RocketShoes:cart', JSON.stringify(openingCart));
        setCart(openingCart);

      }  
    } catch(err) {
      if(err) {
        return toast.error(err as string);
      }
      return toast.error('Erro na adição do protduto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const itemIndex = cart.findIndex((prod) => prod.id === productId);
      if(itemIndex < 0) throw 'Erro na remoção do produto'
      cart.splice(itemIndex, 1);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      setCart([...cart]);
    } catch {
      return toast.error('Erro na remoção do produto');
    }
  };


  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      let stock = null;
      try {
        stock = await api.get(`/stock/${productId}`);
      } catch(err) {
        throw 'Erro na alteração de quantidade do produto'
      }

      // cannot update product to amount < 1
      if(amount < 1) throw 'Erro ao atualizar quantidade do produto';

      // check if product exists in cart
      let index = cart.findIndex((cartItem) => cartItem.id === productId);
      if(index < 0) throw 'Erro na alteração de quantidade do produto'

      if(amount > stock.data.amount) throw 'Quantidade solicitada fora de estoque';

        let newCartArray = cart;
        newCartArray[index].amount = amount;
        await localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartArray));
        setCart([...newCartArray]);

      

    } catch(err) {
      // if not acessing stock happens
        return toast.error(err as string);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
