<template>
  <div class="carousel-wrapper">
    <!-- 範例（若你還沒有購物車圖示）可以放一個有 ref 的 cart icon，實際應放在 navbar 或全域父元件 -->
    <!-- <div ref="cartIcon" class="cart-icon">🛒</div> -->

    <Carousel
      ref="carousel"
      :wrap-around="true"
      :mouse-drag="true"
      :transition="500"
      :items-to-scroll="1"
      :breakpoints="breakpoints"
    >
      <Slide v-for="item in products" :key="item.id">
        <div class="card product-card" @click="$emit('card-click', item.id)">
          <img :src="item.imageUrl" :alt="item.title" class="card-img-top" />
          <div class="card-body text-center">
            <h5 class="card-title">{{ item.title }}</h5>
            <p class="card-text">{{ item.description }}</p>
            <p class="text-danger fw-bold">{{ formatCurrency(item.price) }}</p>

            <div class="mt-auto">
              <button
                type="button"
                class="btn btn-dark btn-sm"
                :disabled="status.loadingItem === item.id"
                @click.stop="$emit('add-to-cart', item.id, $event)"
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
      </Slide>

      <template #addons>
        <Navigation>
          <template #prev>
            <button class="custom-arrow left" aria-label="prev">‹</button>
          </template>
          <template #next>
            <button class="custom-arrow right" aria-label="next">›</button>
          </template>
        </Navigation>
        <Pagination />
      </template>
    </Carousel>
  </div>
</template>

<script>
import { ref } from "vue";
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";

export default {
  name: "ProductCarousel",
  components: { Carousel, Slide, Navigation, Pagination },
  props: {
    products: {
      type: Array,
      required: true,
    },
    cartIconRef: {
      // 新增這個 prop
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      status: {
        loadingItem: "",
      },
      cart: [],
      isLoading: false,
      showCartPreview: false,
      breakpoints: {
        0: {
          itemsToShow: 1, // 手機
        },
        768: {
          itemsToShow: 1, // iPad Air / 平板
        },
        1024: {
          itemsToShow: 3, // 桌機
        },
      },
    };
  },
  setup() {
    const carousel = ref(null);

    function formatCurrency(value) {
      if (!value && value !== 0) return "NT$ 0";
      return new Intl.NumberFormat("zh-TW", {
        style: "currency",
        currency: "TWD",
        minimumFractionDigits: 0,
      }).format(value);
    }

    return {
      carousel,
      formatCurrency,
    };
  },
  mounted() {
    // 選擇性：元件掛載時取得購物車（如果需要）
    // this.getCart();
  },
  methods: {
    getProduct(id) {
      this.$router.push(`/user/product/${id}`);
    },

    animateToCart(event) {
      try {
        const productCard = event.currentTarget.closest(".card");
        const productImg = productCard?.querySelector(".card-img-top");
        const cartIcon = this.cartIconRef || this.$refs.cartIcon;

        if (!productImg || !cartIcon) {
          console.warn(
            "動畫失敗：無法找到圖片或購物車圖示（請在購物車圖示加上 ref='cartIcon'）"
          );
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
      } catch (err) {
        console.error("animateToCart error:", err);
      }
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

          // ✅ 先在前端暫時更新
          const existing = this.cart.find(
            (item) => item.product_id === id || item.product.id === id
          );
          if (existing) {
            existing.qty += 1;
          } else {
            this.cart.push({
              id: Date.now(), // 臨時 ID，避免渲染錯誤
              product_id: id,
              qty: 1,
              product: this.products.find((p) => p.id === id) || {}, // 確保能顯示圖片和名稱
            });
          }

          // ✅ 再去 API 同步，避免資料不同步
          this.getCart();
        })
        .catch(() => {
          this.status.loadingItem = "";
          alert("加入購物車失敗，請稍後再試");
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
    handleOutsideClick(event) {
      const cartIcon = this.$refs.cartIcon;
      if (cartIcon && !cartIcon.contains(event.target)) {
        this.showCartPreview = false;
      }
    },
  },
};
</script>

<style scoped>
.carousel-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow: visible; /* 確保箭頭不會被裁切 */
}
.carousel-wrapper:last-of-type {
  margin-bottom: 48px; /* 手機 */
}

@media (min-width: 768px) {
  .carousel-wrapper:last-of-type {
    margin-bottom: 64px; /* 平板 & 桌機 */
  }
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

/* 卡片固定大小 */
.product-card {
  margin: 0 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card-img-top {
  height: 200px;
  object-fit: cover;
}
.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* ======================== */
/* 自訂箭頭 (基礎樣式) */
/* ======================== */
.custom-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  cursor: pointer;
  z-index: 1000; /* 確保在最上層 */
}

/* 桌機 (>=1024px) */
@media (min-width: 1024px) {
  .custom-arrow.left {
    left: 1px;   /* 🚀 保持在容器內 */
  }
  .custom-arrow.right {
    right: 1px;
  }
}

/* iPad Air (768px–1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .custom-arrow.left {
    left: 5px;    /* 🚀 不要設負數 */
  }
  .custom-arrow.right {
    right: 5px;
  }
}

/* 手機 (<=767px) */
@media (max-width: 767px) {
  .custom-arrow {
    font-size: 1.5rem; /* 箭頭縮小 */
  }
  .custom-arrow.left {
    left: 5px;
  }
  .custom-arrow.right {
    right: 5px;
  }
}

/* ======================== */
/* 分頁圓點樣式 */
/* ======================== */
.carousel__pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
.carousel__pagination-button {
  width: 10px;
  height: 10px;
  margin: 0 4px;
  border-radius: 50%;
  background: #ccc;
  border: none;
  cursor: pointer;
}
.carousel__pagination-button--active {
  background: #333;
}
</style>
