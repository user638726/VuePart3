<template>
  <Loading :active="isLoading"></Loading>
  <div class="container">
    <div class="row justify-content-between align-items-start">
      <!-- 左側：商品圖片 -->
      <div class="col-md-6">
        <img
          :src="product.imageUrl"
          alt=""
          class="img-fluid mb-3"
          ref="productImage"
        />
      </div>
      <!-- 右側：breadcrumb + 商品文字 -->
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/">首頁</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link to="/frontproducts">產品</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ product.title }}
            </li>
          </ol>
        </nav>
        <h2>{{ product.title }}</h2>
        <div>{{ product.content }}</div>
        <div class="mb-4">{{ product.description }}</div>

        <div class="h5" v-if="!product.price">
          {{ formatCurrency(product.origin_price) }} 元
        </div>
        <del class="h6" v-if="product.price">
          原價 {{ formatCurrency(product.origin_price) }} 元
        </del>
        <div class="h5" v-if="product.price">
          現在只要 {{ formatCurrency(product.price) }} 元
        </div>
        <div class="d-flex flex-column flex-sm-row align-items-stretch gap-2">
          <!-- 數量輸入框 -->
          <div class="input-group w-auto align-items-center">
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="decreaseQty"
            >
              −
            </button>
            <input
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              class="form-control text-center"
              style="max-width: 70px"
              v-model.number="qty"
              @blur="validateQty"
              @keydown.prevent="blockNonNumber"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="increaseQty"
            >
              ＋
            </button>
          </div>

          <!-- 加入購物車按鈕 -->
          <button
            type="button"
            class="btn btn-dark"
            @click="addToCart(product.id)"
          >
            加到購物車
          </button>
        </div>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col">
        <div class="accordion" id="accordionExample">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                問與答1：請問課程是實體還是線上？
              </button>
            </h2>
            <div
              id="collapseOne"
              class="accordion-collapse collapse show"
              data-bs-parent="#accordionExample"
            >
              <div class="accordion-body">
                課程是實體的，我們會在指定的地點進行授課，並提供相關的教材和資源。
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                問與答2：付款金額可否退費
              </button>
            </h2>
            <div
              id="collapseTwo"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div class="accordion-body">
                付款金額在課程開始前7天可全額退費，課程開始後則不予退費。
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree"
              >
                問與答3：課程有提供發票嗎？
              </button>
            </h2>
            <div
              id="collapseThree"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div class="accordion-body">
                課程費用包含發票，如需索取請於報名時告知。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <footer class="footer-fixed bg-dark text-white text-center py-3">
    <p>&copy; 2025 籃球瘋. All rights reserved.</p>
  </footer>
</template>

<script>
import emitter from "@/methods/emitter";
export default {
  data() {
    return {
      product: {},
      id: "",
      isLoading: false,
      qty: 1,
    };
  },
  methods: {
    getProduct() {
      const api = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/product/${this.id}`;
      this.isLoading = true;
      this.$http.get(api).then((response) => {
        this.isLoading = false;
        if (response.data.success) {
          this.product = response.data.product;
        }
      });
    },
    validateQty() {
      if (!this.qty || this.qty < 1) {
        this.qty = 1;
      } else {
        this.qty = Math.floor(this.qty); // 去除小數
      }
    },
    increaseQty() {
      this.qty++;
    },
    decreaseQty() {
      if (this.qty > 1) {
        this.qty--;
      }
    },
    blockNonNumber(e) {
      // 允許：數字鍵、刪除鍵、Backspace、Tab、方向鍵
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
      ];
      if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    },

    addToCart(id) {
      this.validateQty();
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
      const cart = {
        product_id: id,
        qty: this.qty,
      };
      this.isLoading = true;
      this.$http.post(url, { data: cart }).then((res) => {
        this.isLoading = false;
        this.$httpMessageState(res, "加入購物車");
        emitter.emit("update-cart");
        this.$router.push("/user/cart");
      });
    },
    formatCurrency(num) {
      const safeNum = Number(num) || 0;
      return `NT$ ${safeNum.toLocaleString()}`;
    },
  },
  created() {
    this.id = this.$route.params.productId;
    this.getProduct();
  },
};
</script>

<style>
.footer-fixed {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 999;
}
html {
  scroll-behavior: smooth;
  background-color: #ffffe0;
}

body {
  background-color: #ffffe0;
}
.container {
  padding-top: 80px; /* 保持原本 navbar 高度的補償 */
  padding-bottom: 100px; /* 新增：避免被固定 footer 遮住 */
}
.breadcrumb-item a {
  color: black !important;
  text-decoration: none; /* 可選：移除底線 */
}

.breadcrumb-item.active {
  color: black;
}
.breadcrumb-item a:hover {
  color: black !important;
}
@media (max-width: 576px) {
  .input-group > .btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
