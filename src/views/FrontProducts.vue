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
      categories: [
        {
          name: "籃球",
          subcategories: ["全部", "攻擊", "防守"],
        },
      ], // <-- 可改成你的實際分類
      selectedCategory: "全部",
      activeCardId: null,
      hoverTimeout: null,
      showCartPreview: false,
    };
  },
  computed: {
    cartQty() {
      return this.cart.reduce((total, item) => total + item.qty, 0);
    },
    filteredProducts() {
      if (!this.selectedCategory || this.selectedCategory === "全部") {
        return this.products; // ✅ 全部商品
      }
      return this.products.filter((product) =>
        product.title
          .toLowerCase()
          .includes(this.selectedCategory.toLowerCase())
      );
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
    handleCardClick(id) {
      // 如果點的是不同卡片，清除之前的 timeout 並重新 hover
      if (this.activeCardId !== id) {
        clearTimeout(this.hoverTimeout);
        this.activeCardId = id;

        // 等待 3000ms 再跳轉頁面
        this.hoverTimeout = setTimeout(() => {
          this.getProduct(id);
        }, 1000);
      }
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
          this.cart = this.cart.filter((item) => item.id !== id);
        })
        .catch(() => {
          alert("刪除商品失敗，請稍後再試");
        });
    },
    formatCurrency(num) {
      return `NT$ ${Number(num).toLocaleString()}`;
    },
    handleOutsideClick(event) {
      const cartIcon = this.$refs.cartIcon;
      if (cartIcon && !cartIcon.contains(event.target)) {
        this.showCartPreview = false;
      }
    },
  },

  mounted() {
    this.getProducts();
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
  <div class="container" style="padding-top: 80px">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="page-title">全部商品</h2>
      </div>
    </div>

    <div class="row">
      <!-- 左側：分類選單 -->
      <div class="col-md-3 mb-4">
        <div class="p-3 bg-white shadow-sm rounded">
          <h5 class="mb-3">商品分類</h5>
          <div v-for="mainCategory in categories" :key="mainCategory.name">
            <strong>{{ mainCategory.name }}</strong>
            <div class="d-flex flex-wrap mt-2">
              <button
                v-for="sub in mainCategory.subcategories"
                :key="sub"
                @click="selectedCategory = sub"
                class="category-btn"
                :class="{ active: selectedCategory === sub }"
              >
                {{ sub }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-9">
        <main class="products-main">
          <section id="products">
            <div class="row">
              <div
                class="col-md-4 mb-4"
                v-for="item in filteredProducts"
                :key="item.id"
              >
                <div
                  class="card h-100"
                  :class="{ active: activeCardId === item.id }"
                  @click="handleCardClick(item.id)"
                >
                  <div
                    class="card-img-top"
                    :style="{
                      height: '200px',
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }"
                  ></div>
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title">{{ item.title }}</h5>
                    <p class="card-text mb-2">
                      <span v-if="item.price">
                        <del class="text-muted"
                          >原價 {{ formatCurrency(item.origin_price) }}</del
                        ><br />
                        <span class="h5 text-danger"
                          >特價 {{ formatCurrency(item.price) }}</span
                        >
                      </span>
                      <span v-else>
                        <span class="h5">{{
                          formatCurrency(item.origin_price)
                        }}</span>
                      </span>
                    </p>
                    <div class="mt-auto">
                      <button
                        type="button"
                        class="btn btn-dark btn-sm"
                        :disabled="status.loadingItem === item.id"
                        @click.stop="addCart(item.id, $event)"
                      >
                        <span
                          v-if="status.loadingItem === item.id"
                          class="spinner-border spinner-border-sm text-light"
                          role="status"
                        ></span>
                        <span v-else>加到購物車</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-title {
  font-size: 24px;
}
.text-muted {
  font-size: 16px;
}
html {
  scroll-behavior: smooth;
  background-color: #ffffe0;
}

body {
  background-color: #ffffe0;
}
.container {
  background-color: #ffffe0;
}
.card {
  cursor: pointer;
  transition:
    transform 0.5s ease,
    box-shadow 0.5s ease;
}
.card:hover,
.card.active {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
.category-btn {
  border: 1px solid #ccc;
  background-color: #fff;
  color: #333;
  padding: 8px 16px;
  margin: 5px 5px 0 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.category-btn:hover {
  background-color: #f0f0f0;
}

.category-btn.active {
  background-color: #343a40;
  color: #fff;
  border-color: #343a40;
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
.products-main {
  padding-bottom: 48px;
}

@media (max-width: 768px) {
  .products-main {
    padding-bottom: 10px;
  }
}

</style>
