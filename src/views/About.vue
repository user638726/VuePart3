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
        console.log('products:', response);
        this.isLoading = false;
      });
    },
    getProduct(id) {
      this.$router.push(`/user/product/${id}`);
    },
   addCart(id, event) {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
  this.status.loadingItem = id;

  const cart = {
    product_id: id,
    qty: 1,
  };

  // 🎯 修正這裡：從卡片中找圖片
  const productCard = event.target.closest('.card');
  const productImg = productCard?.querySelector('.card-img-top');
  const cartIcon = this.$refs.cartIcon;

  // 🛡️ 動畫執行前的防呆判斷
  if (productImg && cartIcon) {
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

    // 動畫起飛
    requestAnimationFrame(() => {
      imgClone.style.left = `${cartRect.left}px`;
      imgClone.style.top = `${cartRect.top}px`;
      imgClone.style.width = '0px';
      imgClone.style.height = '0px';
      imgClone.style.opacity = '0.5';
    });

    // 動畫結束後移除
    imgClone.addEventListener('transitionend', () => {
      imgClone.remove();
    });
  } else {
    console.warn('動畫失敗：無法找到圖片或購物車圖示');
  }

  // 📦 加入購物車 API 請求
  this.$http.post(url, { data: cart })
    .then((res) => {
      console.log('已加入購物車', res);
      this.status.loadingItem = '';
      this.getCart();
    })
    .catch((err) => {
      console.error('加入購物車失敗', err);
      this.status.loadingItem = '';
      alert('加入購物車失敗，請稍後再試');
    });
  },


    getCart() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
  this.isLoading = true;
  this.$http.get(url).then((res) => {
    console.log('Cart API response:', res.data);
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
          <router-link class="nav-link" to="/philosophy">理念</router-link>
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
  <div class="card bg-dark text-black" id="basketball1">
  <img :src="require('@/assets/picture/richard-bagan-SmQ2Cku3alc-unsplash.jpg')" class="card-img" alt="...">
  <div class="card-img-overlay">
    <h5 class="card-title">關於籃球瘋</h5>
    <p class="card-text">「籃球瘋」不只是名詞，是一種生活態度。我們相信籃球能連結人與人、城市與夢想。從街頭到球場，從素人到職業，我們支持每一位為夢想努力的球員。歡迎加入我們，一起為籃球而瘋</p>
  </div>
</div>
</main>
<footer class="footer-fixed bg-dark text-white text-center py-3">
  <p>&copy; 2025 籃球瘋. All rights reserved.</p>
</footer>
</template>

<style>
.footer-fixed {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 999;
}
.card-img-overlay {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2em;
}
.card-title {
  font-size: clamp(1.5rem, 5vw, 3rem);
}

.card-text {
  font-size: clamp(1rem, 3vw, 2rem);
}

</style>