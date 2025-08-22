<script>
export default {
  data() {
  return {
    products: [],
    isLoading: false,
    cart: [],
    status: {
      loadingItem: '',
    },
    };
},
computed: {
  cartQty() {
    return this.cart.reduce((total, item) => total + item.qty, 0);
  }
},
methods: {
    getProducts() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/products/all`;
      this.isLoading = true;
      this.$http.get(url).then((response) => {
        this.products = response.data.products;
        console.log('products:', response);
        this.isLoading = false;
      });
    },
    getProduct(id) {
      this.$router.push(`/user/product/${id}`);
    },
   addCart(id, event) {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
  this.status.loadingItem = id;

  const cart = {
    product_id: id,
    qty: 1,
  };

  // 🎯 修正這裡：從卡片中找圖片
  const productCard = event.target.closest('.card');
  const productImg = productCard?.querySelector('.card-img-top');
  const cartIcon = this.$refs.cartIcon;

  // 🛡️ 動畫執行前的防呆判斷
  if (productImg && cartIcon) {
    const imgClone = productImg.cloneNode(true);
    const imgRect = productImg.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    imgClone.style.position = 'fixed';
    imgClone.style.left = `${imgRect.left}px`;
    imgClone.style.top = `${imgRect.top}px`;
    imgClone.style.width = `${imgRect.width}px`;
    imgClone.style.height = `${imgRect.height}px`;
    imgClone.style.zIndex = 1000;
    imgClone.style.transition = 'all 0.8s ease-in-out';

    document.body.appendChild(imgClone);

    // optional：視覺效果（滑到上方）
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);

    // 動畫起飛
    requestAnimationFrame(() => {
      imgClone.style.left = `${cartRect.left}px`;
      imgClone.style.top = `${cartRect.top}px`;
      imgClone.style.width = '0px';
      imgClone.style.height = '0px';
      imgClone.style.opacity = '0.5';
    });

    // 動畫結束後移除
    imgClone.addEventListener('transitionend', () => {
      imgClone.remove();
    });
  } else {
    console.warn('動畫失敗：無法找到圖片或購物車圖示');
  }

  // 📦 加入購物車 API 請求
  this.$http.post(url, { data: cart })
    .then((res) => {
      console.log('已加入購物車', res);
      this.status.loadingItem = '';
      this.getCart();
    })
    .catch((err) => {
      console.error('加入購物車失敗', err);
      this.status.loadingItem = '';
      alert('加入購物車失敗，請稍後再試');
    });
  },


    getCart() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
  this.isLoading = true;
  this.$http.get(url).then((res) => {
    console.log('Cart API response:', res.data);
    // 假設購物車清單在 res.data.data.carts 中
    if (res.data && res.data.data && Array.isArray(res.data.data.carts)) {
      this.cart = res.data.data.carts;
    } else {
      this.cart = [];
    }
    this.isLoading = false;
  }).catch(() => {
    this.cart = [];
    this.isLoading = false;
  });
},


    scrollTo(id) {
    let el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el = false;
    }
  },
},
    mounted() {
  this.getProducts();
  this.getCart();
},


};

</script>

<template>
<Loading :active="isLoading"></Loading>
  <nav class="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
  <div class="container-fluid">
    <a class="navbar-brand">籃球瘋</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
           <a class="nav-link"  @click.prevent="scrollTo('carouselExampleIndicators')">首頁</a>
        </li>
        <li class="nav-item">
          <a class="nav-link"  @click.prevent="scrollTo('basketball1')">關於</a>
        </li>
        <li class="nav-item">
          <a class="nav-link"  @click.prevent="scrollTo('basketball2')">理念</a>
        </li>
        <li class="nav-item">
          <a class="nav-link"  @click.prevent="scrollTo('products')">產品</a>
        </li>
      </ul>
      <span ref="cartIcon" style="position: relative;">
  <router-link class="navbar-text position-relative" to="/user/cart" style="margin-right: 0.5cm;">
    購物車
    <span v-if="cartQty > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
      {{ cartQty }}
    </span>
  </router-link>
</span>
      
      <router-link class="navbar-text" to="/dashboard/products">後台管理</router-link>
      </div>
  </div>
</nav>
<div id="carouselExampleIndicators" class="carousel slide">
  <div class="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img :src="require('@/assets/picture/basketballpart1.png')" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <img :src="require('@/assets/picture/tj-dragotta-Gl0jBJJTDWs-unsplash.jpg')" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <img :src="require('@/assets/picture/tj-dragotta-mu7amBMAT3E-unsplash.jpg')" class="d-block w-100" alt="...">
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>
<div class="card bg-dark text-black" id="basketball1">
  <img :src="require('@/assets/picture/richard-bagan-SmQ2Cku3alc-unsplash.jpg')" class="card-img" alt="...">
  <div class="card-img-overlay">
    <h5 class="card-title">關於籃球瘋</h5>
    <p class="card-text">「籃球瘋」不只是名詞，是一種生活態度。我們相信籃球能連結人與人、城市與夢想。從街頭到球場，從素人到職業，我們支持每一位為夢想努力的球員。歡迎加入我們，一起為籃球而瘋</p>
  </div>
</div>
<div class="card bg-dark text-black" id="basketball2">
  <img :src="require('@/assets/picture/ben-hershey-5nk3wSFUWZc-unsplash.jpg')" class="card-img" alt="籃球理念圖">
  <div class="card-img-overlay">
    <h5 class="card-title">籃球瘋理念</h5>
    <p class="card-text">我們相信籃球是一種語言，無需翻譯，卻能跨越文化與年齡。無論你是初學者還是老手，在這裡都能找到屬於自己的位置。我們致力於打造一個熱血、自由、且共融的籃球文化圈。</p>
  </div>
</div>
<section class="container my-5" id="products">
  <h2 class="text-center mb-4">熱賣產品</h2>
  <div class="row">
    <div class="col-md-4 mb-4" v-for="item in products" :key="item.id">
      <div class="card h-100">
        <div
          class="card-img-top"
          :style="{
            height: '200px',
            backgroundImage: `url(${item.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }"
        ></div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">{{ item.title }}</h5>
          <p class="card-text mb-2">
            <span v-if="item.price">
              <del class="text-muted">原價 {{ item.origin_price }} 元</del><br>
              <span class="h5 text-danger">特價 {{ item.price }} 元</span>
            </span>
            <span v-else>
              <span class="h5">{{ item.origin_price }} 元</span>
            </span>
          </p>
          <div class="mt-auto">
            <button type="button" class="btn btn-outline-secondary btn-sm me-2" @click="getProduct(item.id)">
              查看更多
            </button>
            <button type="button"
              class="btn btn-dark btn-sm"
              :disabled="status.loadingItem === item.id"
              @click="addCart(item.id, $event)">
            <span v-if="status.loadingItem === item.id"
              class="spinner-border spinner-border-sm text-light" role="status" aria-hidden="true">
            </span>
            <span v-else>加到購物車</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<footer class="bg-dark text-white text-center py-3 mt-5">
  <p>&copy; 2025 籃球瘋. All rights reserved.</p>
</footer>
</template>

<style>
a {
  text-decoration:none;
}
.card-title {
  font-size: clamp(1.5rem, 5vw, 3rem);
}

.card-text {
  font-size: clamp(1rem, 3vw, 2rem);
}
html {
  scroll-behavior: smooth;
}
.card-img-overlay {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2em;
}
</style>