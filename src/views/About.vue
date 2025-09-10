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
    handleOutsideClick(event) {
      const cartIcon = this.$refs.cartIcon;
      if (cartIcon && !cartIcon.contains(event.target)) {
        this.showCartPreview = false;
      }
    },
  },
  mounted() {
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
    <div class="about-page">
      <!-- Hero -->
      <section
        class="about-hero-section text-center d-flex align-items-center justify-content-center"
      >
        <div class="overlay"></div>
        <div class="content">
          <h2 class="fw-bold mb-2 text-white">關於我們</h2>
          <p class="text-light">About Us</p>
        </div>
      </section>

      <!-- 內容區塊 -->
      <div class="container py-5">
        <!-- 品牌介紹 -->
        <section class="mb-5">
          <h3 class="fw-bold mb-3 text-start">品牌介紹</h3>
          <div class="card shadow-sm border-0">
            <img
              src="@/assets/picture/ben-hershey-5nk3wSFUWZc-unsplash.jpg"
              alt="品牌介紹圖片"
              class="card-img-top"
              style="height: 400px; object-fit: cover"
            />
            <div class="card-body">
              <p class="text-muted">
                籃球瘋是一個專注於 籃球技術訓練
                的平台，致力於幫助每一位球員在基礎動作、比賽應用與籃球思維上全面提升。
                我們深信：籃球不只是天賦，更是一門可以系統化學習的技術。
                在這裡，你能找到： 專業教練設計的訓練課程
                從基礎到進階的動作分解教學 線上資源與數據分析，讓學習更有效率
                我們的目標是打造一個
                陪伴球員成長的訓練環境，不論你是剛接觸籃球的新手，還是追求突破的進階球員，都能在籃球瘋找到適合自己的訓練方式。
                籃球瘋，讓熱愛籃球的你，透過科學化訓練，踏出更穩健的一步。
              </p>
            </div>
          </div>
        </section>

        <!-- 品牌理念 -->
        <section class="mb-5">
          <h3 class="fw-bold mb-3 text-start">品牌理念</h3>
          <div class="card shadow-sm border-0">
            <img
              src="@/assets/picture/richard-bagan-SmQ2Cku3alc-unsplash.jpg"
              alt="品牌理念圖片"
              class="card-img-top"
              style="height: 400px; object-fit: cover"
            />
            <div class="card-body">
              <p class="text-muted">
                我們秉持「專業、實用、持續成長」的核心理念：
                專業：結合教練經驗與科學數據，提供正確高效的訓練。
                實用：訓練內容強調動作應用，幫助球員能在比賽中真正發揮。
                持續成長：無論你的起點在哪裡，籃球瘋都希望成為你一路向上的最佳夥伴。
                我們深信，每一位球員都有潛力，只需要正確的學習方式與堅持，就能不斷進步。
              </p>
            </div>
          </div>
        </section>

        <!-- 品牌故事 -->
        <section class="mb-5">
          <h3 class="fw-bold mb-3 text-start">品牌故事</h3>
          <div class="card shadow-sm border-0">
            <img
              src="@/assets/picture/tj-dragotta-mu7amBMAT3E-unsplash.jpg"
              alt="品牌故事圖片"
              class="card-img-top"
              style="height: 400px; object-fit: cover"
            />
            <div class="card-body">
              <p class="text-muted">
                籃球瘋的誕生，來自於一群對籃球充滿熱情的教練與球員。
                我們看見許多球員在訓練過程中遇到瓶頸：
                有些人缺乏系統化的練習方向，有些人不知道如何把動作轉化為比賽中的能力。
                因此，我們決定打造一個
                人人都能接觸到的訓練平台，讓更多人能透過正確的方法提升自己。
                籃球瘋不只是訓練工具，而是一個 陪伴球員成長、交流與突破的社群。
                在這裡，我們一起努力，一起變強，一起享受籃球帶來的熱血與快樂。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.about-hero-section {
  position: relative;
  height: 300px;
  background-image: url("@/assets/picture/tj-dragotta-Gl0jBJJTDWs-unsplash.jpg");
  background-size: cover;
  background-position: center;
}

.about-hero-section .overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.about-hero-section .content {
  position: relative;
  z-index: 1;
}

.about-block h3 {
  font-size: 1.5rem;
}

html {
  scroll-behavior: smooth;
  background-color: #ffffe0;
}

body {
  background-color: #ffffe0;
}
.text-muted {
  font-size: 30px;
}
/* 🔁 手機 RWD 調整 */
img {
  width: 1000px;
  height: 800px;
  object-fit: cover;
}

@media (max-width: 576px) {
  img {
    width: 100%; /* 手機寬度滿版 */
    height: auto; /* 高度自動 */
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
