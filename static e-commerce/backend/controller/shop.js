const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const { Op } = require("sequelize");


exports.getProducts = (req, res, next) => {
   let page = !req.query.page ? 1 : parseInt(req.query.page);

    let totalItems;
    let start = (page * 2) - 1;
    let end = page * 2;

    // console.log("inside getProducts controller...");
    Product.findAll().then(products => {
        totalItems = products.length;
    }).then(() => {
        Product.findAll({
            where: {
                id: {
                    [Op.between]: [start, end],
                }
            }

        
        }).then(products => {
            console.log('end total items >>> ', end, totalItems);
            
            res.json({
                "products": products, "pagination": {
                    currentPage: page,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    hasPreviousPage: page > 1,
                    hasNextPage: end < totalItems,
                }
            });
        }).catch(err => {
            console.log(err);
        })
    })
 
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



exports.getOrders = (req, res, next) => {
 try {
        const result = [];
        const orders = await req.user.getOrders();
        await Promise.all(orders.map(async (order) => {
            const obj = {};
            obj.orderId = order.id;
            const o = await Order.findByPk(order.id);
            const products = await o.getProducts();
            const p = [];
            products.map(product => {
                p.push(product.dataValues);
            })
            obj.productDetail = p;
            result.push(obj);
            console.log(result);

        }))
        res.status(200).json({ data: result });
    } catch (err) {
        res.status(500).json({ err: err })
    }
};


