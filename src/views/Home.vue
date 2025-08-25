<script>
export default {
  data() {
  return {
    products: [],
    isLoading: false,
    cart: [],
    status: {
      loadingItem: '',
    },
    };
},
computed: {
  cartQty() {
    return this.cart.reduce((total, item) => total + item.qty, 0);
  }
},
methods: {
    getProducts() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/products/all`;
      this.isLoading = true;
      this.$http.get(url).then((response) => {
        this.products = response.data.products;
        this.isLoading = false;
      });
    },
    getProduct(id) {
      this.$router.push(`/user/product/${id}`);
    },
    animateToCart(event) {
    const productCard = event.target.closest('.card');
    const productImg = productCard?.querySelector('.card-img-top');
    const cartIcon = this.$refs.cartIcon;

    if (!productImg || !cartIcon) {
      console.warn('動畫失敗：無法找到圖片或購物車圖示');
      return;
    }

    const imgClone = productImg.cloneNode(true);
    const imgRect = productImg.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    imgClone.style.position = 'fixed';
    imgClone.style.left = `${imgRect.left}px`;
    imgClone.style.top = `${imgRect.top}px`;
    imgClone.style.width = `${imgRect.width}px`;
    imgClone.style.height = `${imgRect.height}px`;
    imgClone.style.zIndex = 1000;
    imgClone.style.transition = 'all 0.8s ease-in-out';

    document.body.appendChild(imgClone);

    requestAnimationFrame(() => {
      imgClone.style.left = `${cartRect.left}px`;
      imgClone.style.top = `${cartRect.top}px`;
      imgClone.style.width = '0px';
      imgClone.style.height = '0px';
      imgClone.style.opacity = '0.5';
    });

    imgClone.addEventListener('transitionend', () => {
      imgClone.remove();
    });
  },
  addCart(id, event) {
    const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
    this.status.loadingItem = id;

    const cart = {
      product_id: id,
      qty: 1,
    };

    this.animateToCart(event);

    this.$http.post(url, { data: cart })
      .then(() => {
        this.status.loadingItem = '';
        this.getCart();
      })
      .catch(() => {
        this.status.loadingItem = '';
        alert('加入購物車失敗，請稍後再試');
      });
  },

    getCart() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
  this.isLoading = true;
  this.$http.get(url).then((res) => {
    // 假設購物車清單在 res.data.data.carts 中
    if (res.data && res.data.data && Array.isArray(res.data.data.carts)) {
      this.cart = res.data.data.carts;
    } else {
      this.cart = [];
    }
    this.isLoading = false;
  }).catch(() => {
    this.cart = [];
    this.isLoading = false;
  });
},
},
    mounted() {
  this.getProducts();
  this.getCart();
},


};

</script>

<template>
<Loading :active="isLoading"></Loading>
  <nav class="navbar navbar-expand-lg bg-dark fixed-top" data-bs-theme="dark">
  <div class="container-fluid">
    <router-link class="navbar-brand" to="/">籃球瘋</router-link>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <router-link class="nav-link" to="/about">關於</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/frontproducts">產品</router-link>
        </li>
      </ul>
      <span ref="cartIcon" style="position: relative;">
  <router-link class="navbar-text position-relative" to="/user/cart" style="margin-right: 0.5cm;">
    購物車
    <span v-if="cartQty > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
      {{ cartQty }}
    </span>
  </router-link>
      </span>
      </div>
  </div>
</nav>
<main class="flex-grow-1 mt-5">
<div class="container py-4">
  <div class="row align-items-center">
    <div class="col-md-6">
      <h1>歡迎來到籃球瘋</h1>
      <p>這裡是最強的籃球訓練平台！</p>
      <button class="btn" style="background-color: #212121; color: white;" @click="$router.push('/frontproducts')">立即選購</button>
    </div>
    <div class="col-md-6 text-end">
      <img :src="require('@/assets/picture/basketballpart1.png')" class="img-fluid" alt="籃球首頁圖" style="padding-top:12px">
    </div>
  </div>
</div>
</main>


<footer class="footer-fixed bg-dark text-white text-center py-3">
  <p>&copy; 2025 籃球瘋. All rights reserved.</p>
</footer>
</template>

<style>
a {
  text-decoration:none;
}

html {
  scroll-behavior: smooth;
  background-color: #FFFFE0;
}

body {
  background-color: #FFFFE0;
}
.footer-fixed {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 999;
}
</style>