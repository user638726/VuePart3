<script>
import emitter from "@/methods/emitter";
export default {
  data() {
    return {
      products: [],
      isLoading: false,
      cart: [],
      status: {
        loadingItem: "",
      },
      showCartPreview: false,
      isMobile: false,
    };
  },
  computed: {
    cartQty() {
      return this.cart.reduce((total, item) => total + item.qty, 0);
    },
    cartItems() {
      return this.cart; // 或進一步處理顯示格式
    },
    cartIconEvents() {
      if (this.isMobile) {
        return {
          click: this.toggleCartPreview,
        };
      } else {
        return {
          mouseenter: () => {
            this.showCartPreview = true;
          },
          mouseleave: () => {
            this.showCartPreview = false;
          },
        };
      }
    },
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
      const productCard = event.target.closest(".card");
      const productImg = productCard?.querySelector(".card-img-top");
      const cartIcon = this.$refs.cartIcon;

      if (!productImg || !cartIcon) {
        console.warn("動畫失敗：無法找到圖片或購物車圖示");
        return;
      }

      const imgClone = productImg.cloneNode(true);
      const imgRect = productImg.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      imgClone.style.position = "fixed";
      imgClone.style.left = `${imgRect.left}px`;
      imgClone.style.top = `${imgRect.top}px`;
      imgClone.style.width = `${imgRect.width}px`;
      imgClone.style.height = `${imgRect.height}px`;
      imgClone.style.zIndex = 1000;
      imgClone.style.transition = "all 0.8s ease-in-out";

      document.body.appendChild(imgClone);

      requestAnimationFrame(() => {
        imgClone.style.left = `${cartRect.left}px`;
        imgClone.style.top = `${cartRect.top}px`;
        imgClone.style.width = "0px";
        imgClone.style.height = "0px";
        imgClone.style.opacity = "0.5";
      });

      imgClone.addEventListener("transitionend", () => {
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

      this.$http
        .post(url, { data: cart })
        .then(() => {
          this.status.loadingItem = "";
          this.getCart();
        })
        .catch(() => {
          this.status.loadingItem = "";
          alert("加入購物車失敗，請稍後再試");
        });
    },
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
          this.cart = this.cart.filter((item) => item.id !== id); // 刪除後重新取得購物車
        })
        .catch(() => {
          alert("刪除商品失敗，請稍後再試");
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
  mounted() {
    this.isMobile = window.innerWidth <= 768; // ✅ 手機裝置判斷
    document.addEventListener("click", this.handleOutsideClick);
    emitter.on("update-cart", this.getCart);
    this.getProducts();
    this.getCart();
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    emitter.off("update-cart", this.getCart);
  },
};
</script>

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
  <main class="flex-grow-1 mt-5 pb-5">
    <div class="card bg-dark text-black" id="basketball1">
      <img
        :src="
          require('@/assets/picture/richard-bagan-SmQ2Cku3alc-unsplash.jpg')
        "
        class="card-img"
        alt="籃球圖片"
      />
      <div class="card-img-overlay">
        <h5 class="card-title">關於籃球瘋</h5>
        <p class="card-text">「籃球瘋」不只是名詞，是一種生活態度。</p>
        <p class="card-text">我們相信籃球能連結人與人、城市與夢想。</p>
        <p class="card-text">從街頭到球場，從素人到職業，</p>
        <p class="card-text">我們支持每一位為夢想努力的球員。</p>
        <p class="card-text">歡迎加入我們，一起為籃球而瘋</p>
      </div>
    </div>
    <div class="card bg-dark text-black" id="basketball2">
      <img
        :src="require('@/assets/picture/ben-hershey-5nk3wSFUWZc-unsplash.jpg')"
        class="card-img"
        alt="籃球理念圖"
      />
      <div class="card-img-overlay">
        <h5 class="card-title">籃球瘋介紹</h5>
        <p class="card-text">
          我們相信籃球是一種語言，無需翻譯，卻能跨越文化與年齡。
        </p>
        <p class="card-text">
          無論你是初學者還是老手，在這裡都能找到屬於自己的位置。
        </p>
        <p class="card-text">
          我們致力於打造一個熱血、自由、且共融的籃球文化圈。
        </p>
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
  background-color: rgba(255, 255, 255, 0.75);
  padding: 1em 2em 1.5em 2em; /* 上右下左 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  word-break: break-word;
}

.card-title {
  font-size: clamp(1.5rem, 5vw, 3rem);
  margin-top: 0; /* 移除預設間距 */
}

.card-text {
  font-size: clamp(1rem, 3vw, 2rem);
}

.card-img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

html {
  scroll-behavior: smooth;
  background-color: #ffffe0;
}

body {
  background-color: #ffffe0;
}

/* 🔁 手機 RWD 調整 */
@media (max-width: 576px) {
  .card-img-overlay {
    position: relative;
    background-color: rgba(255, 255, 255, 0.9);
    height: auto;
  }

  .card-img {
    max-height: none;
    height: auto;
  }
  main {
    padding-bottom: 120px; /* ⬅️ 增加底部空間以避免 footer 擋到內容 */
  }
}
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
</style>
