const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart?.items?.length) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    if (!shippingAddress?.firstName || !shippingAddress?.lastName || !shippingAddress?.street ||
      !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zipCode) {
      return res.status(400).json({ message: 'Shipping address is incomplete' });
    }

    const orderItems = cart.items
      .filter(item => item?.product)
      .map(item => ({
        product: item?.product?._id,
        name: item?.product?.name ?? 'Product',
        image: item?.product?.images?.[0] ?? '',
        price: Number(item?.price ?? item?.product?.price ?? 0),
        quantity: Number(item?.quantity ?? 0)
      }))
      .filter(item => item.product);

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Your cart contains invalid items' });
    }

    const itemsPrice = cart.totalAmount;
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    // Update stock
    for (const item of cart.items) {
      const productId = item?.product?._id;
      if (!productId) continue;

      const product = await Product.findById(productId);
      if (!product) continue;

      product.stock = Math.max(0, product.stock - Number(item?.quantity ?? 0));
      await product.save();
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], totalAmount: 0 });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const query = req.user.isAdmin ? {} : { user: req.user.id };
    const orders = await Order.find(query)
      .populate('user', 'username email firstName lastName isAdmin')
      .select('-__v')
      .lean()
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email')
      .select('-__v')
      .lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order?.user?._id?.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    if (status === 'paid' || req.body.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
