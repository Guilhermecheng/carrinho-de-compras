# carrinho-de-compras
Hook for a shopping cart. Project used to train the use of Hooks in React.<br><br>
<img src="https://user-images.githubusercontent.com/62719629/137635418-f69a7731-207e-4526-91e2-dfc669849f68.png" height="600px" /><br>
**Home page**
<br><br><br>
<img src="https://user-images.githubusercontent.com/62719629/137821369-356d8a48-08bc-4c56-9938-20876ac115ec.png" height="350px" /><br>
**Cart page**
<br><br><br>
## App functions

The main functionalities developed are: 
- add products to cart;
- change amount of item (add and subtract);
- show amount for each item in main page;
- show cart in cart page;
- show cart item count in header;
- also, all useCart hook`s functions

## useCart

This project`s brain is useCart hook. All functionalities of this app comes from it.
<br><br>
### Cart
Cart is a state in React, of an array of objects. It comes originally from localStorage, and is updated each time a new product is added, excluded, or its amount is changed. 
```javascript
const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
```

***It`s type***
```javascript
export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}
```
<br><br>
### addProduct
Function to add a new product to cart if it doesn`t exist. If cart already has it, just change amount to +1.
```javascript
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

```
<br><br>
### removeProduct
Remove product from cart.
```javascript
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

```
<br><br>
### updateProduct
function to update product amount in Cart page; cand add or subtract amount.

```javascript
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

```
