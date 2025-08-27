<template>
  <Loading :active="isLoading"></Loading>
  <div class="my-5 row justify-content-center" style="padding-top: 70px;">
    <form class="col-md-6" @submit.prevent="payOrder">
      <table class="table align-middle">
        <thead>
        <th>品名</th>
        <th>數量</th>
        <th class="text-end">單價</th>
        </thead>
        <tbody>
        <tr v-for="item in order.products" :key="item.id">
          <td>{{ item.product.title }}</td>
          <td>{{ item.qty }}/{{ item.product.unit }}</td>
          <td class="text-end font-monospace">{{ formatCurrency(item.final_total) }}</td>
        </tr>
        </tbody>
        <tfoot>
         <tr>
            <td colspan="2" class="text-end fw-bold">總計</td>
            <td class="text-end fw-bold">{{ formatCurrency(order.total) }}</td>
         </tr>
        </tfoot>

      </table>

      <table class="table">
        <tbody>
        <tr>
          <th width="100">Email</th>
          <td>{{ order.user.email }}</td>
        </tr>
        <tr>
          <th>姓名</th>
          <td>{{ order.user.name }}</td>
        </tr>
        <tr>
          <th>收件人電話</th>
          <td>{{ order.user.tel }}</td>
        </tr>
        <tr>
          <th>收件人地址</th>
          <td>{{ order.user.address }}</td>
        </tr>
        <tr>
          <th>付款狀態</th>
          <td>
            <span v-if="!order.is_paid">尚未付款</span>
            <span v-else class="text-success">付款完成</span>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="text-end" v-if="order.is_paid === false">
        <button class="btn btn-dark">確認付款去</button>
      </div>
    </form>
  </div>
  <footer class="footer-fixed bg-dark text-white text-center py-3">
  <p>&copy; 2025 籃球瘋. All rights reserved.</p>
</footer>
</template>

<script>
export default {
  data() {
    return {
      order: {
        user: {},
      },
      orderId: '',
      isLoading: false,
    };
  },
  methods: {
    getOrder() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/order/${this.orderId}`;

      this.$http.get(url)
        .then((res) => {
          if (res.data.success) {
            this.order = res.data.order;
          }
        });
    },
    payOrder() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/pay/${this.orderId}`;

      this.$http.post(url)
        .then((res) => {

          if (res.data.success) {
            this.getOrder();
          }
          setTimeout(() => {
            this.$router.push(`/frontproducts`);
          }, 10000);
        });
    },
    formatCurrency(value) {
    if (typeof value !== 'number') return value;
    return 'NT$' + value.toLocaleString('zh-TW');
  },
  },
  created() {
    this.orderId = this.$route.params.orderId;
    this.getOrder();
  },
};
</script>
<style scoped>
.footer-fixed {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 999;
}
</style>