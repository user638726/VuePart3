<template>
  <div class="carousel-wrapper">
    <Carousel
      ref="carousel"
      v-model:currentSlide="currentSlide"
      :wrap-around="true"
      :mouse-drag="true"
      :transition="500"
      :items-to-scroll="1"
      :breakpoints="breakpoints"
    >
      <Slide v-for="item in products" :key="item.id">
        <div class="card product-card" @click="emit('card-click', item.id)">
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
                @click.stop="emit('add-to-cart', item.id, $event)"
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
        <Pagination class="custom-pagination" />
      </template>
    </Carousel>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";

defineProps({
  products: {
    type: Array,
    required: true,
  },
  cartIconRef: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["card-click", "add-to-cart"]);

const carousel = ref(null);
const currentSlide = ref(0);
const status = reactive({
  loadingItem: "",
});
const breakpoints = {
  0: { itemsToShow: 1 },
  768: { itemsToShow: 1 },
  1024: { itemsToShow: 3 },
};

function formatCurrency(value) {
  if (!value && value !== 0) return "NT$ 0";
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(value);
}
</script>

<style scoped>
.carousel-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow: visible;
}
.carousel-wrapper:last-of-type {
  margin-bottom: 48px;
}
@media (min-width: 768px) {
  .carousel-wrapper:last-of-type {
    margin-bottom: 64px;
  }
}

.card {
  cursor: pointer;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}
.card:hover,
.card.active {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
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

/* 自訂箭頭 */
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
  z-index: 1000;
}
@media (min-width: 1024px) {
  .custom-arrow.left {
    left: -15px;
  }
  .custom-arrow.right {
    right: -15px;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .custom-arrow.left {
    left: -5px;
  }
  .custom-arrow.right {
    right: -5px;
  }
}
@media (max-width: 767px) {
  .custom-arrow {
    font-size: 1.5rem;
  }
  .custom-arrow.left {
    left: -5px;
  }
  .custom-arrow.right {
    right: -5px;
  }
}

/* 分頁圓點樣式 */
.custom-pagination {
  position: relative;
  margin-top: 20px !important; /* ✅ 推到卡片下方 */
  display: flex !important;
  justify-content: center;
}

.custom-pagination .carousel__pagination-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;
  margin: 0 6px;
  transition: background 0.3s ease, transform 0.3s ease;
}

.custom-pagination .carousel__pagination-button--active {
  background: #333;
  transform: scale(1.2);
}
</style>
