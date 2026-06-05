<script setup>
import TitleList from "@/components/TitleList.vue";
import ProductCarousel from "@/components/ProductCarousel.vue";
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

  <main class="flex-grow-1 pagemain">
    <section class="hero-section d-flex align-items-center">
      <div class="hero-overlay"></div>
      <div class="container position-relative">
        <div class="row">
          <div class="col-lg-6 col-md-8">
            <h1 class="display-3 fw-bold text-white">籃球瘋</h1>
            <p class="lead text-white">這裡是最強的籃球訓練平台！</p>
            <button
              class="btn btn-dark btn-lg mt-3"
              @click="$router.push('/frontproducts')"
            >
              立即選購
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新消息 -->
    <div class="row mb-5">
      <div class="col-12 d-flex justify-content-center">
        <div class="content-wrapper">
          <TitleList />
        </div>
      </div>
    </div>

    <!-- 熱賣產品 -->
    <div class="row">
      <div class="col-12 d-flex justify-content-center">
        <div class="content-wrapper">
          <h2 class="text-center fw-bold mb-4">熱賣產品</h2>
          <ProductCarousel
            v-if="products.length"
            :products="products"
            :cart-icon-ref="$refs.cartIcon"
            :cart-qty="cartQty"
            @add-to-cart="(id, $event) => addCart(id, $event)"
            @card-click="getProduct"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style>
a {
  text-decoration: none;
}
html {
  scroll-behavior: smooth;
  background-color: #ffffe0;
}

body {
  background-color: #ffffe0;
}

.content-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 15px;
}
.pagemain{
  padding-bottom: 48px;
}

/* navbar hover & active 設定 */
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

.hero-section {
  position: relative;
  height: 70vh;
  background: url("@/assets/picture/basketballpart1.png") center center/cover no-repeat;
  margin-top: -56px;
  padding-top: 56px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1));
}

.hero-section .container {
  position: relative;
  z-index: 2;
}
</style>
