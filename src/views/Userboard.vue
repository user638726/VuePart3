<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand position-relative" to="/user/cart">購物車<span v-if="cartQty > 0"
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
    {{ cartQty }}
  </span></router-link>
      <router-link class="navbar-brand" to="/">首頁</router-link>
    </div>
  </nav>
  <div class="container-fluid mt-3 position-relative">
    <ToastMessages></ToastMessages>
    <RouterView/>
  </div>
</template>

<script>
import emitter from '@/methods/emitter';
import ToastMessages from '@/components/ToastMessages.vue';

export default {
  components: {
    ToastMessages,
  },
   data() {
    return {
      cart: [],
    };
  },
  computed: {
    cartQty() {
      return this.cart.reduce((total, item) => total + item.qty, 0);
    },
  },
  methods: {
    getCart() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
      this.$http.get(url).then((res) => {
        if (res.data?.data?.carts) {
          this.cart = res.data.data.carts;
        }
      });
    },
  },
  provide() {
    return {
      emitter,
    };
  },
  mounted() {
    this.getCart();
    emitter.on('update-cart', this.getCart);
  },
  beforeUnmount() {
  emitter.off('update-cart', this.getCart);
  },
};
</script>