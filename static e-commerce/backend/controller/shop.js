const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.json({products,success:true})
      //res.render('shop/product-list', {
      //  prods: products,
      //  pageTitle: 'All Products',
      //  path: '/products'
      //});
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(cart =>{
    return cart
    .getProducts()
    .then(products =>{
      res.status(200).json({
        success:true,
        products:products
      })

    })
    .catch(err => {
      res.status(500).json({success:false,message:'error occur'})
  });

  })
  .catch(err => {
    res.status(500).json({success:false,message:'error occur'})
});
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity =1;
  req.user
  .getCart()
    .then(cart =>{
      fetchedCart =cart;
      return cart.getProducts({wheere:{id:prodId}})
    })
    .then(products =>{
      let product;
      if (product){
        const OldQuantity = product.cartItem.quantity;
        newQuantity = OldQuantity+1;
        return product;
      }
      return Product.findById(prodId);

      })
      .then(product =>{
        return fetchedCart.addProduct(product,{
          through:{ quantity:newQuantity}
        })
      })
      .then(() =>{
        res.status(200).json({ success:true,message:'succesfully added the product'});
      })
      .catch(err => {
        res.status(500).json({success:false,message:'error occur'})
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
