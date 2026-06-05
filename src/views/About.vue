<script setup>
import emitter from "@/methods/emitter";
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from "vue";
import { useRouter } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();

const products = ref([]);
const isLoading = ref(false);
const cart = ref([]);
const status = reactive({ loadingItem: "" });
const showCartPreview = ref(false);

const cartIcon = ref(null);

const cartQty = computed(() => cart.value.reduce((total, item) => total + item.qty, 0));
const cartItems = computed(() => cart.value);
const cartIconEvents = computed(() => ({
  mouseenter: () => {
    showCartPreview.value = true;
  },
  mouseleave: () => {
    showCartPreview.value = false;
  },
}));

function getProducts() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/products/all`;
  isLoading.value = true;
  proxy.$http.get(url).then((response) => {
    products.value = response.data.products;
    isLoading.value = false;
  });
}

// eslint-disable-next-line no-unused-vars
function getProduct(id) {
  router.push(`/user/product/${id}`);
}

function animateToCart(event) {
  const productCard = event.target.closest(".card");
  const productImg = productCard?.querySelector(".card-img-top");
  const iconEl = cartIcon.value;

  if (!productImg || !iconEl) {
    console.warn("動畫失敗：無法找到圖片或購物車圖示");
    return;
  }

  const imgClone = productImg.cloneNode(true);
  const imgRect = productImg.getBoundingClientRect();
  const cartRect = iconEl.getBoundingClientRect();

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
}

// eslint-disable-next-line no-unused-vars
function addCart(id, event) {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
  status.loadingItem = id;

  const cartPayload = {
    product_id: id,
    qty: 1,
  };

  animateToCart(event);

  proxy.$http
    .post(url, { data: cartPayload })
    .then(() => {
      status.loadingItem = "";
      getCart();
    })
    .catch(() => {
      status.loadingItem = "";
      alert("加入購物車失敗，請稍後再試");
    });
}

function getCart() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
  isLoading.value = true;
  proxy.$http
    .get(url)
    .then((res) => {
      if (res.data && res.data.data && Array.isArray(res.data.data.carts)) {
        cart.value = res.data.data.carts;
      } else {
        cart.value = [];
      }
      isLoading.value = false;
    })
    .catch(() => {
      cart.value = [];
      isLoading.value = false;
    });
}

function removeCartItem(id) {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart/${id}`;
  proxy.$http
    .delete(url)
    .then(() => {
      cart.value = cart.value.filter((item) => item.id !== id);
    })
    .catch(() => {
      alert("刪除商品失敗，請稍後再試");
    });
}

function handleOutsideClick(event) {
  const iconEl = cartIcon.value;
  if (iconEl && !iconEl.contains(event.target)) {
    showCartPreview.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
  emitter.on("update-cart", getCart);
  getProducts();
  getCart();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
  emitter.off("update-cart", getCart);
});
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
          <li class="nav-item">
            <router-link class="nav-link" to="/news">最新消息</router-link>
          </li>
        </ul>

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
      <section
        class="about-hero-section text-center d-flex align-items-center justify-content-center"
      >
        <div class="overlay"></div>
        <div class="content">
          <h2 class="fw-bold mb-2 text-white">關於我們</h2>
          <p class="text-light">About Us</p>
        </div>
      </section>

      <!-- 內容區塊置中且寬度限制在 10 欄 -->
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10">
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
                    從基礎到進階的動作分解教學
                    線上資源與數據分析，讓學習更有效率 我們的目標是打造一個
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
                    籃球瘋不只是訓練工具，而是一個
                    陪伴球員成長、交流與突破的社群。
                    在這裡，我們一起努力，一起變強，一起享受籃球帶來的熱血與快樂。
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
  background-color: #ffffe0;
}

body {
  background-color: #ffffe0;
}
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

.text-muted {
  font-size: clamp(16px, 2.5vw, 20px);
  line-height: 1.8;
}

/* RWD: 讓圖片在手機滿版 */
.about-img {
  width: 100%;
  max-width: 600px;
  display: block;
  margin: 0 auto;
  border-radius: 12px;
}

@media (max-width: 576px) {
  .about-img {
    width: 100%;
    height: auto;
  }
}

.navbar.bg-dark .navbar-brand,
.navbar.bg-dark .nav-link,
.navbar.bg-dark .cart-link,
.navbar[data-bs-theme="dark"] .navbar-brand,
.navbar[data-bs-theme="dark"] .nav-link,
.navbar[data-bs-theme="dark"] .cart-link {
  color: #ffffff !important;
  transition: color 0.18s ease-in-out;
}

.navbar.bg-dark .navbar-brand:hover,
.navbar.bg-dark .nav-link:hover,
.navbar.bg-dark .cart-link:hover,
.navbar[data-bs-theme="dark"] .navbar-brand:hover,
.navbar[data-bs-theme="dark"] .nav-link:hover,
.navbar[data-bs-theme="dark"] .cart-link:hover {
  color: #f8d90f !important;
  font-weight: 700 !important;
}

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
