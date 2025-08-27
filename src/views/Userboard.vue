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
      <span ref="cartIcon" style="position: relative;" 
      v-on="cartIconEvents">
  <router-link class="navbar-text position-relative" to="/user/cart" style="margin-right: 0.5cm;">
    購物車
    <span v-if="cartQty > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
      {{ cartQty }}
    </span>
  </router-link>
      <div v-if="showCartPreview && cartQty > 0"
     class="cart-preview position-absolute bg-white text-dark border rounded shadow"
     style="top: 100%; right: 0; z-index: 2000; width: 300px; max-height: 350px; overflow-y: auto;">
  <div v-for="item in cartItems" :key="item.id" class="d-flex align-items-center p-2 border-bottom">
    <img :src="item.product.imageUrl" alt="商品圖片" class="me-2" style="width: 50px; height: 50px; object-fit: cover;">
    <div class="flex-grow-1">
      <div class="fw-bold">{{ item.product.title }}</div>
      <div class="text-dark small">數量: {{ item.qty }}</div>
    </div>
    <button class="btn btn-sm btn-outline-danger ms-2"
            @click.stop.prevent="removeCartItem(item.id)">
      &times;
    </button>
  </div>
  <div class="p-2 text-center">
    <router-link to="/user/cart" class="btn btn-sm btn-dark">前往購物車</router-link>
  </div>
</div>
</span>
      </div>
  </div>
</nav>
  <div class="container-fluid mt-3 position-relative">
    <ToastMessages></ToastMessages>
    <RouterView/>
  </div>
</template>

<script>
import emitter from '@/methods/emitter';
import ToastMessages from '@/components/ToastMessages.vue';

export default {
  components: {
    ToastMessages,
  },
   data() {
    return {
      cart: [],
      isLoading: false,
      showCartPreview: false,
      isMobile: false,
    };
  },
  computed: {
    cartQty() {
      return this.cart.reduce((total, item) => total + item.qty, 0);
    },
    cartItems() {
    return this.cart;
  },
  cartIconEvents() {
    if (this.isMobile) {
      return {
        click: this.toggleCartPreview,
      };
    } else {
      return {
        mouseenter: () => { this.showCartPreview = true; },
        mouseleave: () => { this.showCartPreview = false; },
      };
    }
  },
  },
  methods: {
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
removeCartItem(id) {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart/${id}`;
  this.$http.delete(url)
    .then(() => {
      this.cart = this.cart.filter(item => item.id !== id);
      emitter.emit('update-cart'); // 刪除後重新取得購物車
      if (this.$route.path === '/user/cart') {
        this.getCart();
      }
    })
    .catch(() => {
      alert('刪除商品失敗，請稍後再試');
    });
},
   toggleCartPreview() {
    this.showCartPreview = !this.showCartPreview;
  },
  handleOutsideClick(event) {
    const cartIcon = this.$refs.cartIcon;
    if (cartIcon && !cartIcon.contains(event.target)) {
      this.showCartPreview = false;
    }
  },
  },
  provide() {
    return {
      emitter,
    };
  },
  
  mounted() {
    this.getCart();
    this.isMobile = window.innerWidth <= 768; // ✅ 手機裝置判斷
    document.addEventListener('click', this.handleOutsideClick);
    emitter.on('update-cart', this.getCart);
  },
  beforeUnmount() {
  document.removeEventListener('click', this.handleOutsideClick);  
  emitter.off('update-cart', this.getCart);
  },
};
</script>
<style scoped>
@media (max-width: 768px) {
  .cart-preview {
    position: fixed !important;
    top: 60px !important;
    right: 10px !important;
    width: 90% !important;
    max-width: 300px;
    max-height: 70vh !important;
    overflow-y: auto;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
}




</style>