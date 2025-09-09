<template>
  <Loading :active="isLoading"></Loading>
  <nav class="navbar navbar-expand-lg bg-dark fixed-top" data-bs-theme="dark">
    <div class="container-fluid">
      <!-- 籃球瘋 -->
      <router-link class="navbar-brand" to="/"> 籃球瘋 </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarText"
        aria-controls="navbarText"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
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
          <li class="nav-item">
            <router-link class="nav-link" to="/news">最新消息</router-link>
          </li>
        </ul>

        <!-- 右邊購物車 -->
        <ul class="navbar-nav ms-auto">
          <span ref="cartIcon" class="cart-wrapper" v-on="cartIconEvents">
            <div class="cart-anchor">
              <router-link
                class="nav-link cart-link"
                to="/user/cart"
                style="margin-right: 0.5cm"
              >
                購物車
                <span
                  v-if="cartQty > 0"
                  class="cart-badge badge rounded-pill bg-danger"
                >
                  {{ cartQty }}
                </span>
              </router-link>
            </div>
            <!-- 購物車預覽清單 -->
            <div
              v-if="showCartPreview && cartQty > 0"
              class="cart-preview position-absolute bg-white text-dark border rounded shadow"
            >
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="d-flex align-items-center p-2 border-bottom"
              >
                <img
                  :src="item.product.imageUrl"
                  alt="商品圖片"
                  class="me-2"
                  style="width: 50px; height: 50px; object-fit: cover"
                />
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ item.product.title }}</div>
                  <div class="text-dark small">數量: {{ item.qty }}</div>
                </div>
                <button
                  class="btn btn-sm btn-outline-danger ms-2"
                  @click.stop.prevent="removeCartItem(item.id)"
                >
                  &times;
                </button>
              </div>
              <div class="p-2 text-center">
                <router-link to="/user/cart" class="btn btn-sm btn-dark">
                  前往購物車
                </router-link>
              </div>
            </div>
          </span>
        </ul>
      </div>
    </div>
  </nav>
  <div class="container-fluid mt-3 position-relative">
    <ToastMessages />
    <RouterView />
  </div>
</template>

<script>
import emitter from "@/methods/emitter";
import ToastMessages from "@/components/ToastMessages.vue";

export default {
  components: {
    ToastMessages,
  },
  data() {
    return {
      cart: [],
      isLoading: false,
      showCartPreview: false,
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
      return {
        mouseenter: () => {
          this.showCartPreview = true;
        },
        mouseleave: () => {
          this.showCartPreview = false;
        },
      };
    },
  },
  methods: {
    getCart() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
      this.isLoading = true;
      this.$http
        .get(url)
        .then((res) => {
          // 假設購物車清單在 res.data.data.carts 中
          if (res.data && res.data.data && Array.isArray(res.data.data.carts)) {
            this.cart = res.data.data.carts;
          } else {
            this.cart = [];
          }
          this.isLoading = false;
        })
        .catch(() => {
          this.cart = [];
          this.isLoading = false;
        });
    },
    removeCartItem(id) {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart/${id}`;
      this.$http
        .delete(url)
        .then(() => {
          this.cart = this.cart.filter((item) => item.id !== id);
          emitter.emit("update-cart"); // 刪除後重新取得購物車
          if (this.$route.path === "/user/cart") {
            this.getCart();
          }
        })
        .catch(() => {
          alert("刪除商品失敗，請稍後再試");
        });
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
    document.addEventListener("click", this.handleOutsideClick);
    emitter.on("update-cart", this.getCart);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    emitter.off("update-cart", this.getCart);
  },
};
</script>
<style>
/* 滑鼠 hover / 手機點擊選單項目時變色 */
/* ============================
   Navbar 顏色控制（覆蓋 Bootstrap）
   - hover 時變黃
   - active（router-link-active / .active）保持黃
   ============================ */

/* 通用目標：支援 .bg-dark 或 data-bs-theme="dark" 的 navbar */
.navbar.bg-dark,
.navbar[data-bs-theme="dark"] {
  /* nothing here, 用來增加選擇器命中率 */
}

/* 預設（白色）*/
.navbar.bg-dark .navbar-brand,
.navbar.bg-dark .nav-link,
.navbar.bg-dark .cart-link,
.navbar[data-bs-theme="dark"] .navbar-brand,
.navbar[data-bs-theme="dark"] .nav-link,
.navbar[data-bs-theme="dark"] .cart-link {
  color: #ffffff !important;
  transition: color 0.18s ease-in-out;
}

/* hover -> 黃色 */
.navbar.bg-dark .navbar-brand:hover,
.navbar.bg-dark .nav-link:hover,
.navbar.bg-dark .cart-link:hover,
.navbar[data-bs-theme="dark"] .navbar-brand:hover,
.navbar[data-bs-theme="dark"] .nav-link:hover,
.navbar[data-bs-theme="dark"] .cart-link:hover {
  color: #f8d90f !important;
  font-weight: 700 !important;
}

/* active（Vue Router 的 router-link-active，也可能有 .active）保持黃色 */
/* 這裡把 router-link-active 與 .active 都覆蓋掉以保險 */
.navbar.bg-dark .navbar-brand.router-link-active,
.navbar.bg-dark .nav-link.router-link-active,
.navbar.bg-dark .cart-link.router-link-active,
.navbar.bg-dark .navbar-brand.active,
.navbar.bg-dark .nav-link.active,
.navbar.bg-dark .cart-link.active,
.navbar[data-bs-theme="dark"] .navbar-brand.router-link-active,
.navbar[data-bs-theme="dark"] .nav-link.router-link-active,
.navbar[data-bs-theme="dark"] .cart-link.router-link-active,
.navbar[data-bs-theme="dark"] .navbar-brand.router-link-exact-active,
.navbar[data-bs-theme="dark"] .nav-link.router-link-exact-active,
.navbar[data-bs-theme="dark"] .cart-link.router-link-exact-active,
.navbar[data-bs-theme="dark"] .navbar-brand.active,
.navbar[data-bs-theme="dark"] .nav-link.active,
.navbar[data-bs-theme="dark"] .cart-link.active {
  color: #f8d90f !important;
  font-weight: 700 !important;
}

/* 小補強：focus 狀態也一併處理 */
.navbar.bg-dark .nav-link:focus,
.navbar[data-bs-theme="dark"] .nav-link:focus {
  color: #f8d90f !important;
}


/* cart badge 定位 */
.cart-link {
  position: relative;
  display: inline-block;
}

.cart-link .cart-badge {
  position: absolute;
  top: -0.4rem;
  right: -0.6rem;
}

.cart-wrapper {
  position: relative;
}

/* 預覽清單 */
.cart-preview {
  animation: fadeIn 0.2s ease-in-out;
  position: absolute;
  top: 100%;
  right: 0; 
  z-index: 2000;
  width: 300px;
  max-height: 350px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .cart-preview {
    left: 0 !important;
    right: auto !important;
    width: calc(100vw - 20px);
    max-width: none;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
a.navbar-text[to="/user/cart"] {
  text-decoration: none !important;
}
</style>
