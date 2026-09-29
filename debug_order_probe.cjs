const http = require('http');

function request(method, path, headers = {}, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const req = http.request({
      host: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      }
    }, (res) => {
      let out = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { out += chunk; });
      res.on('end', () => {
        try {
          const json = out ? JSON.parse(out) : {};
          resolve({ status: res.statusCode, json, text: out });
        } catch (err) {
          resolve({ status: res.statusCode, text: out });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async function main() {
  try {
    const productList = await request('GET', '/api/products');
    console.log('productsStatus', productList.status);
    console.log('productsText', productList.text);

    const products = productList.json && Array.isArray(productList.json.products)
      ? productList.json.products
      : [];

    const product = products.find((p) => p?.isActive !== false) || products[0];

    if (!product) {
      console.log('No product found');
      return;
    }

    const customer = await request('POST', '/api/users/register', {}, {
      name: 'Debug User',
      email: 'debug_' + Date.now() + '@example.com',
      password: 'pass123',
      phone: '9999999999'
    });
    console.log('registerStatus', customer.status);
    console.log('registerText', customer.text);

    if (!(customer.json && customer.json.token)) {
      console.log('No customer token');
      return;
    }

    const token = customer.json.token;
    const order = await request('POST', '/api/orders', { Authorization: 'Bearer ' + token }, {
      items: [{
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size: product.sizes && product.sizes[0] ? product.sizes[0] : '',
        color: product.colors && product.colors[0] ? product.colors[0] : '',
        image: product.images && product.images[0] ? product.images[0] : '',
      }],
      totalAmount: product.price,
      shippingAddress: {
        fullName: 'Debug User',
        phone: '9999999999',
        address: '123 Test Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });
    console.log('orderStatus', order.status);
    console.log('orderText', order.text);

    const mine = await request('GET', '/api/orders/mine', { Authorization: 'Bearer ' + token });
    console.log('mineStatus', mine.status);
    console.log('mineText', mine.text);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
