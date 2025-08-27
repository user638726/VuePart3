<template>
  <Loading :active="isLoading"></Loading>
  <div class="container" style="padding-top: 70px;">
    <div class="row mt-4">
      
      <!-- 購物車列表 -->
       <div class="col-md-5 mx-auto">
        <div class="sticky-top">
          <table class="table align-middle">
            <thead>
              <tr>
                <th></th>
                <th>品名</th>
                <th style="width: 110px">數量</th>
                <th>單價</th>
              </tr>
            </thead>
            <tbody>
            <template v-if="cart.carts">
              <tr v-for="item in cart.carts" :key="item.id">
                <td>
                  <button type="button" class="btn btn-outline-danger btn-sm"
                          :disabled="status.loadingItem === item.id"
                          @click="removeCartItem(item.id)">
                    <i class="bi bi-x"></i>
                  </button>
                </td>
                <td>
                  {{ item.product.title }}
                  <div class="text-success" v-if="item.coupon">
                    已套用優惠券
                  </div>
                </td>
                <td>
                  <div class="input-group input-group-sm">
                    <input type="number" class="form-control"
                          min="1"
                          :disabled="item.id === status.loadingItem"
                          @change="updateCart(item)"
                          v-model.number="item.qty">
                    <div class="input-group-text">/ {{ item.product.unit }}</div>
                  </div>
                </td>
                <td class="text-end">
                  <small v-if="cart.final_total !== cart.total" class="text-success">折扣價：</small>
                  NT$ {{ $filters.currency(item.final_total) }}
                </td>
              </tr>
            </template>
            </tbody>
            <tfoot>
            <tr>
              <td colspan="3" class="text-end">總計</td>
              <td class="text-end">NT$ {{ $filters.currency(cart.total) }}</td>
            </tr>
            <tr v-if="cart.final_total !== cart.total">
              <td colspan="3" class="text-end text-success">折扣價</td>
              <td class="text-end text-success">NT$ {{ $filters.currency(cart.final_total) }}</td>
            </tr>
            </tfoot>
          </table>
          <div class="input-group mb-3 input-group-sm">
            <input type="text" class="form-control" v-model="coupon_code" placeholder="請輸入優惠碼:GOATM">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" type="button" @click="addCouponCode">
                套用優惠碼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
     <div class="my-5 row justify-content-center">
      <Form class="col-md-6" v-slot="{ errors }"
            @submit="createOrder">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <Field id="email" name="email" type="email" class="form-control"
                   :class="{ 'is-invalid': errors['email'] }"
                   placeholder="請輸入 Email" rules="email|required"
                   v-model="form.user.email"></Field>
          <ErrorMessage name="email" class="invalid-feedback"></ErrorMessage>
        </div>

        <div class="mb-3">
          <label for="name" class="form-label">收件人姓名</label>
          <Field id="name" name="name" type="text" class="form-control"
                   :class="{ 'is-invalid': errors['name'] }"
                   placeholder="請輸入姓名" rules="required"
                   v-model="form.user.name"></Field>
          <ErrorMessage name="name" class="invalid-feedback"></ErrorMessage>
        </div>

        <div class="mb-3">
          <label for="tel" class="form-label">收件人電話</label>
          <Field id="tel" name="tel" type="tel" class="form-control"
                   :class="{ 'is-invalid': errors['tel'] }"
                   placeholder="請輸入電話" rules="required"
                   v-model="form.user.tel"></Field>
          <ErrorMessage name="tel" class="invalid-feedback"></ErrorMessage>
        </div>

        <div class="mb-3">
          <label for="address" class="form-label">收件人地址</label>
          <Field id="address" name="address" type="text" class="form-control"
                   :class="{ 'is-invalid': errors['address'] }"
                   placeholder="請輸入地址" rules="required"
                   v-model="form.user.address"></Field>
          <ErrorMessage name="address" class="invalid-feedback"></ErrorMessage>
        </div>

        <div class="mb-3">
          <label for="message" class="form-label">留言[選填]</label>
          <textarea name="" id="message" class="form-control" cols="30" rows="10"
                    v-model="form.message"></textarea>
        </div>
        <div class="text-end">
          <button class="btn btn-dark">送出訂單</button>
        </div>
      </Form>
    </div>
  </div>
  <footer class="footer-fixed bg-dark text-white text-center py-3">
  <p>&copy; 2025 籃球瘋. All rights reserved.</p>
</footer>
</template>

<script>
import Swal from 'sweetalert2'
import emitter from '@/methods/emitter';
export default {
  data() {
    return {
      products: [],
      product: {},
      isLoading: false, 
      status: {
        loadingItem: '',
      },
       form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      cart:{},
      coupon_code:'',
    };
  },
  methods: {
    getProducts() {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/products/all`;
      this.isLoading = true;
      this.$http.get(url).then((response) => {
        this.products = response.data.products;
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
      .then(()=>{
         this.status.loadingItem='';
         emitter.emit('update-cart');
         this.getCart();
      });
    },
    getCart(){
       const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart`;
       this.isLoading = true;
       this.$http.get(url).then((res)=>{
        this.cart = res.data.data;
        this.isLoading = false;
       });
    },
    updateCart(item){
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart/${item.id}`;
      this.isLoading = true;
      this.status.loadingItem = item.id
      const cart = {
        product_id:item.product.id,
        qty:item.qty,
      };
      this.$http.put(url,{data:cart}).then(()=>{
            emitter.emit('update-cart');
            this.status.loadingItem = '';
         this.getCart();   
      });
    },
    removeCartItem(id) {
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/cart/${id}`;
      this.status.loadingItem = id;
      this.$http.delete(url).then(() => {
       this.status.loadingItem = '';
       emitter.emit('update-cart');
       this.getCart(); // 重新取得購物車資料
     });
    },
    addCouponCode(){
    const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/coupon`;
    const coupon = {
      code:this.coupon_code,
    };
    this.$http.post(url,{data:coupon})
      .then((res)=>{
        if (!res.data.success) {
        alert(res.data.message || '優惠碼無效或已過期');
        return;
        }
         this.getCart();
      }).catch((error)=>{
     const errorMessage = error?.response?.data?.message || '優惠碼無效或已過期';
     alert(errorMessage);
  });
    },
    createOrder(){
      const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/order`;
      const order = this.form;
      this.$http.post(url,{data:order})
      .then((res)=>{
            emitter.emit('update-cart');
            const orderId = res.data.orderId; // 從 API 回傳中取得 orderId
            this.$router.push(`/user/checkout/${orderId}`);
            
      });
    },
  },
  mounted() {
  emitter.on('update-cart', this.getCart);
  },
  beforeUnmount() {
  emitter.off('update-cart', this.getCart);
  },

  created() {
    Swal.fire({
    icon: 'info',
    title: '優惠提醒',
    text: '請輸入優惠碼 GOATM，就可以享有 50% 折扣！',
    confirmButtonText: '了解'
    });
    this.getProducts();
    this.getCart();
  },
};
</script>
<style>
html {
  scroll-behavior: smooth;
  background-color: #FFFFE0;
}

body {
  background-color: #FFFFE0;
}
.container {
  padding-bottom: 100px; /* 或 footer 高度 + 一點空間 */
}
.container,
.row,
.col-md-5,
.table {
  background-color: transparent;
}
.footer-fixed {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 999;
}

</style>
