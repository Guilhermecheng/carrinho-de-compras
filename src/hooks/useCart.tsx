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
    console.log("buscando o cart "+ storagedCart)
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
  

  const addProduct = async (productId: number) => {
    try {
      const stock = await api.get(`/stock/${productId}`);
      const productData = await api.get(`/products/${productId}`)

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
        console.log(err)
        return toast.error(err as string);
      }
      return toast.error('erro ao acessar database');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };


  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const stock = await api.get(`/stock/${productId}`);
      if(!stock) throw 'Erro ao acessar o estoque';

      let index = cart.findIndex((cartItem) => cartItem.id === productId);

      if(cart[index].amount < stock.data.amount) {
        let newCartArray = cart;
        newCartArray[index].amount = amount;
        await localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartArray));
        setCart([...newCartArray]);

      } else {
        throw 'Quantidade solicitada fora de estoque';
      }

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
