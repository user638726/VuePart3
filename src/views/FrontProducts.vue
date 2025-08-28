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
          subcategories: ["攻擊", "防守"],
        },
      ], // <-- 可改成你的實際分類
      selectedCategory: "",
      activeCardId: null,
      hoverTimeout: null,
      showCartPreview: false,
      isMobile: false,
    };
  },
  computed: {
    cartQty() {
      return this.cart.reduce((total, item) => total + item.qty, 0);
    },
    filteredProducts() {
      if (!this.selectedCategory) return this.products;
      // 根據商品標題是否包含分類關鍵字進行篩選（不區分大小寫）
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
    handleCardClick(id) {
      // 如果點的是不同卡片，清除之前的 timeout 並重新 hover
      if (this.activeCardId !== id) {
        clearTimeout(this.hoverTimeout);
        this.activeCardId = id;

        // 等待 3000ms 再跳轉頁面
        this.hoverTimeout = setTimeout(() => {
          this.getProduct(id);
        }, 3000);
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
    this.getProducts();
    this.getCart();
    this.isMobile = window.innerWidth <= 768; // ✅ 手機裝置判斷
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
      <router-link class="navbar-brand" to="/">籃球瘋</router-link>
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
        </ul>
        <span ref="cartIcon" style="position: relative" v-on="cartIconEvents">
          <router-link
            class="navbar-text position-relative"
            to="/user/cart"
            style="margin-right: 0.5cm"
          >
            購物車
            <span
              v-if="cartQty > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ cartQty }}
            </span>
          </router-link>
          <div
            v-if="showCartPreview && cartQty > 0"
            class="cart-preview position-absolute bg-white text-dark border rounded shadow"
            style="
              top: 100%;
              right: 0;
              z-index: 2000;
              width: 300px;
              max-height: 350px;
              overflow-y: auto;
            "
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
              <router-link to="/user/cart" class="btn btn-sm btn-dark"
                >前往購物車</router-link
              >
            </div>
          </div>
        </span>
      </div>
    </div>
  </nav>
  <div class="container" style="padding-top: 80px">
    <div class="row">
      <!-- 左側：商品分類 -->
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

          <button
            class="btn btn-outline-secondary btn-sm mt-4 w-100"
            @click="selectedCategory = ''"
          >
            清除篩選
          </button>
        </div>
      </div>
      <div class="col-md-9">
        <main style="padding-bottom: 100px">
          <section id="products">
            <h2 class="text-center mb-4">全部商品</h2>
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
@media (max-width: 768px) {
  .cart-preview {
    position: fixed !important;
    top: 60px !important;
    right: 10px !important;
    width: 90% !important;
    max-width: 300px;
    max-height: 70vh !important;
    overflow-y: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}
</style>
