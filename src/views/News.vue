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
  <div class="title-list-container">
    <h2 class="fw-bold text-center mb-4">最新消息</h2>

    <!-- 外層灰底 -->
    <div class="news-box">
      <!-- 內層白底清單 -->
      <ul class="news-list">
        <li v-for="(post, index) in posts" :key="index" class="news-item">
          <a
            :href="getFirstLink(post)"
            target="_blank"
            rel="noopener noreferrer"
            class="news-title"
          >
            {{ post.postInfo.title }}
          </a>
        </li>
      </ul>
      <div v-if="error" style="color: red" class="mt-3">錯誤：{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import emitter from "@/methods/emitter";
import { useRouter } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();

const products = ref([]);
const isLoading = ref(false);
const cart = ref([]);
const status = reactive({ loadingItem: "" });
const showCartPreview = ref(false);
const files = ["nba01.json"];
const posts = ref([]);
const error = ref(null);

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

async function loadAllJsonFiles() {
  try {
    const fetchPromises = files.map((file) =>
      fetch(file).then((res) => {
        if (!res.ok) throw new Error(`${file} 載入失敗`);
        return res.json();
      })
    );

    const allData = await Promise.all(fetchPromises);

    allData.forEach((dataArray) => {
      dataArray.forEach((item) => {
        if (item.postInfo?.title && item.postInfo.title !== "unknown") {
          posts.value.push(item);
        }
      });
    });
  } catch (err) {
    error.value = err.message;
    alert("載入失敗：" + err.message);
  }
}

function getFirstLink(post) {
  const links = post.contentInfo?.link || [];
  const imageLinks = post.contentInfo?.image || [];
  const filtered = links.filter((link) => !imageLinks.includes(link));
  return filtered[0] || links[0] || "#";
}

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
  loadAllJsonFiles();
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

<style>
.title-list-container {
  margin-top: 100px; /* 與上方 hero 區塊距離 */
  margin-bottom: 70px;
  max-width: 1500px; /* ✅ 限制區塊最大寬度 */
  margin-left: auto;
  margin-right: auto;
}

/* 灰色外框 */
.news-box {
  background: #F0F0F0;
  border-radius: 6px;
  padding: 20px;
}

/* 白底清單 */
.news-list {
  background: #ffffff;
  border-radius: 4px;
  padding: 15px;
  margin: 0;
  list-style: none;
}

/* 單一項目 */
.news-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.news-item:last-child {
  border-bottom: none;
}

/* 文字樣式 - 強制黑色 */
:deep(.news-title) {
  color: #000 !important;   /* 強制黑色 */
  text-decoration: none;
}

/* 點過文章也保持黑色 */
:deep(.news-title:visited) {
  color: #000 !important;
}

/* 滑過才變藍色 */
:deep(.news-title:hover),
:deep(.news-title:visited:hover) {
  color: #1e88e5 !important;
  text-decoration: underline;
}
html, body {
  scroll-behavior: smooth;
  background-color: #ffffe0;
}
</style>
