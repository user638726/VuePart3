<template>
   <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <RouterLink to="/dashboard" class="navbar-brand">後台管理</RouterLink>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <RouterLink to="/dashboard/products" class="nav-link">產品</RouterLink>
          <RouterLink to="/dashboard/orders" class="nav-link">訂單</RouterLink>
          <RouterLink to="/dashboard/coupons" class="nav-link">優惠券</RouterLink>
          <a href="#" @click.prevent="logout" class="nav-link">登出</a>
        </div>
    </div>
    <RouterLink class="navbar-brand" to="/">首頁</RouterLink>
  </div>
</nav>
</template>

<script>
export default {
   methods:{
    logout(){
       const api = `${process.env.VUE_APP_API}logout`;
      this.$http.post(api, this.user)
      .then((res)=>{
        if(res.data.success) {
          console.log(res);
          this.$router.push('/');          
        }
      });
    },
   },
};
</script>