import { createContext, ReactNode, useContext, useState } from 'react';
import { toast, ToastContent } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

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
      const stock = await api.get(`/stock/${productId}`);
      // if (!stock) throw 'Estoque não pode ser verificado';
      // let storaged = await localStorage.getItem('@RocketShoes:cart');

      // if(storaged) {          
      //   let storagedJson = JSON.parse(storaged);        

      //   for(var i = 0; i < storagedJson.length; i++) {
      //     if(storagedJson[i].productId === productId) {
      //         if(storagedJson[i].amount < stock.data.amount) {
      //           storagedJson[i].amount++;
      //           await localStorage.setItem('@RocketShoes:cart', JSON.stringify(storagedJson));
      //           return              
      //         } else {
      //           throw 'Quantidade insuficiente em estoque';
      //         }
      //     }
      //   }
        
      //   let newArray = [...storagedJson, {productId, amount: 1}];
      //   await localStorage.setItem('@RocketShoes:cart', JSON.stringify(newArray));
        
      // } else {
      //   let newProductToCart = [{
      //     productId,
      //     amount: 1,
      //   }];

      //   await localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProductToCart));
      //   console.log('abrindo carrinho')
      // }   
      
    } catch(err) {
      console.log(err)
      return toast.error(err as string);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  // TEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESTAAAAAAAAAAAAAAAAAAAAR
  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const stock = await api.get(`/stock/${productId}`);
      if(!stock) throw 'Erro ao acessar o estoque';

      let index = cart.findIndex(cartItem => cartItem.id === productId);
      if(cart[index].amount < stock.data.amount) {
        cart[index].amount = amount
        setCart(cart);
      } else {
        throw 'Quantidade solicitada fora de estoque';
      }

      // TODO
    } catch(err) {
      // TODO
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
