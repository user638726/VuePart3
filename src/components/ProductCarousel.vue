<template v-if="products && products.length">
  <div class="carousel-wrapper mx-auto"> 
  <Carousel
    :items-to-show="1"
    :wrap-around="true"
    :mouse-drag="true"
    :show-arrows="true"
    :pause-autoplay-on-hover="true"
    :transition="500"
  >
    <Slide v-for="item in products" :key="item.id">
      <div
        class="card mx-auto product-card"
        :class="{ active: activeCardId === item.id }"
        style="max-width: 500px; cursor: pointer;"
        @click="handleCardClick(item.id)"
      >
        <img :src="item.imageUrl" :alt="item.title" class="card-img-top" />
        <div class="card-body text-center">
          <h5 class="card-title">{{ item.title }}</h5>
          <p class="card-text">{{ item.description }}</p>
          <p class="text-danger fw-bold">NT$ {{ item.price.toLocaleString() }}</p>
          <button
            class="btn btn-dark"
            @click.stop="$emit('add-to-cart', item.id, $event)"
          >
            加入購物車
          </button>
        </div>
      </div>
    </Slide>
    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>
  </div>
</template>

<script>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/carousel.css'

export default {
  name: 'ProductCarousel',
  data() {
     return {
       activeCardId: null, // 手機點擊用的 hover 狀態
     };
   },
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation,
  },
  props: {
    products: {
      type: Array,
      required: true
    }
  },
  methods: {
  handleCardClick(id) {
    this.activeCardId = id;

  setTimeout(() => {
    this.$emit('card-click', id);
    this.activeCardId = null; // 清除 hover 樣式
  }, 5000);
  },
},

};
</script>

<style scoped>
.product-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.product-card.active {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}
.carousel-wrapper {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
  padding-bottom: 80px; /* 👈 加這個讓卡片不貼到 footer */
}

@media (max-width: 768px) {
  .carousel-wrapper {
    padding-bottom: 100px; /* 手機下可能再多一點 */
  }
}
.card-title {
  font-size: 24px;
}

.card-text {
  font-size: 16px;
}
</style>
