<template>
  <Loading :active="isLoading"></Loading>
  <div class="stepper-container">
    <div class="step" :class="{ active: currentStep >= 1 }">
      <div class="circle">1</div>
      <div class="label">購物車</div>
    </div>
    <div class="arrow" :class="{ active: currentStep >= 2 }"></div>
    <div class="step" :class="{ active: currentStep >= 2 }">
      <div class="circle">2</div>
      <div class="label">填寫資料</div>
    </div>
    <div class="arrow" :class="{ active: currentStep >= 3 }"></div>
    <div class="step" :class="{ active: currentStep >= 3 }">
      <div class="circle">3</div>
      <div class="label">完成訂單</div>
    </div>
  </div>

  <div class="my-5 row justify-content-center" style="padding-top: 70px">
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
            <td class="text-end font-monospace">
              {{ formatCurrency(item.final_total) }}
            </td>
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
</template>

<script>
export default {
  data() {
    return {
      order: {
        user: {},
      },
      orderId: "",
      isLoading: false,
      currentStep: 2,
    };
  },
  methods: {
    getOrder() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/order/${this.orderId}`;

      this.$http.get(url).then((res) => {
        if (res.data.success) {
          this.order = res.data.order;
        }
      });
    },
    payOrder() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/pay/${this.orderId}`;

      this.$http.post(url).then((res) => {
        if (res.data.success) {
          this.getOrder();
        }
        this.currentStep = 3;
        setTimeout(() => {
          this.$router.push(`/frontproducts`);
        }, 3000);
      });
    },
    formatCurrency(value) {
      if (typeof value !== "number") return value;
      return "NT$" + value.toLocaleString("zh-TW");
    },
  },
  created() {
    this.orderId = this.$route.params.orderId;
    this.getOrder();
  },
};
</script>
<style scoped>

.stepper-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 80px; /* 頂部留空，避免被 fixed navbar 遮住 */
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ccc;
  color: white;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step.active .circle {
  background-color: #000;
}

.label {
  margin-top: 5px;
  font-size: 14px;
  white-space: nowrap;
}

/* 箭頭樣式 */
.arrow {
  position: relative;
  width: 40px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 4px; /* 加粗線條 */
  background-color: #ccc;
}

.arrow::after {
  content: "";
  position: absolute;
  right: -6px;
  width: 10px;
  height: 10px;
  border-top: 4px solid #ccc;
  border-right: 4px solid #ccc;
  transform: rotate(45deg);
  background-color: transparent;
}

.arrow.active::before {
  background-color: #000;
}

.arrow.active::after {
  border-color: #000;
}
</style>
