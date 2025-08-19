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
     addCart(id){
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`
      this.status.loadingItem = id
      const cart ={
       product_id:id
      ,qty:1,};
      this.$http.post(url,{data:cart})
      .then((res)=>{
         this.status.loadingItem='';
         console.log(res)
         this.getCart();
      });
    },
    getCart(){
       const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
       this.isLoading = true;
       this.$http.get(url).then((res)=>{
        console.log(res);
        this.cart = res.data.data;
        this.isLoading = false;
       });
    },
    },
    mounted() {
  this.getProducts();
},


};

</script>

<template>
<Loading :active="isLoading"></Loading>
  <nav class="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">籃球瘋</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
           <a class="nav-link" href="/">首頁</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#basketball1">關於</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#basketball2">理念</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#products">產品</a>
        </li>
      </ul>
      <a href="/user/cart"><span class="navbar-text" style="margin-right: 0.5cm;">
        購物車
      </span></a>
      <a href="/dashboard/products"><span class="navbar-text">
        後台管理
      </span></a>
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
      <img src="../assets/picture/basketballpart1.png" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <img src="../assets/picture/tj-dragotta-Gl0jBJJTDWs-unsplash.jpg" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <img src="../assets/picture/tj-dragotta-mu7amBMAT3E-unsplash.jpg" class="d-block w-100" alt="...">
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
  <img src="../assets/picture/richard-bagan-SmQ2Cku3alc-unsplash.jpg" class="card-img" alt="...">
  <div class="card-img-overlay">
    <h5 class="card-title">關於籃球瘋</h5>
    <p class="card-text">「籃球瘋」不只是名詞，是一種生活態度。我們相信籃球能連結人與人、城市與夢想。從街頭到球場，從素人到職業，我們支持每一位為夢想努力的球員。歡迎加入我們，一起為籃球而瘋</p>
  </div>
</div>
<div class="card bg-dark text-black" id="basketball2">
  <img src="../assets/picture/ben-hershey-5nk3wSFUWZc-unsplash.jpg" class="card-img" alt="籃球理念圖">
  <div class="card-img-overlay">
    <h5 class="card-title">籃球瘋理念</h5>
    <p class="card-text">我們相信籃球是一種語言，無需翻譯，卻能跨越文化與年齡。無論你是初學者還是老手，在這裡都能找到屬於自己的位置。我們致力於打造一個熱血、自由、且共融的籃球文化圈。</p>
  </div>
</div>
<section class="container my-5" id="products">
  <h2 class="text-center mb-4">熱賣產品</h2>
  <div class="row justify-content-center">
    <div class="col-md-10">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in products" :key="item.id">
            <td style="width: 200px">
              <div style="height: 100px; background-size: cover; background-position: center"
                   :style="{backgroundImage: `url(${item.imageUrl})`}"></div>
            </td>
            <td>
              <a href="#" class="text-dark" @click.prevent="getProduct(item.id)">{{ item.title }}</a>
            </td>
            <td>
              <div class="h5" v-if="!item.price">{{ item.origin_price }} 元</div>
              <del class="h6" v-if="item.price">原價 {{ item.origin_price }} 元</del>
              <div class="h5" v-if="item.price">現在只要 {{ item.price }} 元</div>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-secondary"
                        @click="getProduct(item.id)">
                  查看更多
                </button>
                <button type="button" class="btn btn-outline-danger"
                        :disabled="status.loadingItem === item.id"
                        @click="addCart(item.id)">
                  <div v-if="status.loadingItem === item.id"
                       class="spinner-grow text-danger spinner-grow-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  加到購物車
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
  font-size: 3rem;
}
.card-text {
  font-size: 2rem;
}
html {
  scroll-behavior: smooth;
}
.card-img-overlay {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2em;
}
</style>