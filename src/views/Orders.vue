<template>
  <Loading :active="isLoading"></Loading>
  <table class="table mt-4">
    <thead>
      <tr>
        <th>購買時間</th>
        <th>Email</th>
        <th>購買款項</th>
        <th>應付金額</th>
        <th>是否付款</th>
        <th>編輯</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(item, key) in orders" :key="key">
        <tr v-if="orders.length" :class="{ 'text-secondary': !item.is_paid }">
          <td>{{ $filters.date(item.create_at) }}</td>
          <td><span v-text="item.user.email" v-if="item.user"></span></td>
          <td>
            <ul class="list-unstyled">
              <li v-for="(product, i) in item.products" :key="i">
                {{ product.product.title }} 數量：{{ product.qty }}
                {{ product.product.unit }}
              </li>
            </ul>
          </td>
          <td class="text-right">{{ item.total }}</td>
          <td>
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                :id="`paidSwitch${item.id}`"
                v-model="item.is_paid"
                @change="updatePaid(item)"
              />
              <label class="form-check-label" :for="`paidSwitch${item.id}`">
                <span v-if="item.is_paid">已付款</span>
                <span v-else>未付款</span>
              </label>
            </div>
          </td>
          <td>
            <div class="btn-group">
              <button
                class="btn btn-outline-primary btn-sm"
                @click="openModal(false, item)"
              >
                檢視
              </button>
              <button
                class="btn btn-outline-danger btn-sm"
                @click="openDelOrderModal(item)"
              >
                刪除
              </button>
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
  <OrderModal
    :order="tempOrder"
    ref="orderModal"
    @update-order="handleUpdateOrder"
    @update-paid="updatePaid"
  ></OrderModal>
  <DelModal :item="tempOrder" ref="delModal" @del-item="delOrder"></DelModal>
  <Pagination :pages="pagination" @emit-pages="getOrders"></Pagination>
</template>

<script setup>
import { getCurrentInstance, onBeforeMount, ref } from "vue";
import DelModal from "@/components/DelModal.vue";
import OrderModal from "@/components/OrderModal.vue";
import Pagination from "@/components/Pagination.vue";

const { proxy } = getCurrentInstance();

const orders = ref({});
const pagination = ref({});
const isLoading = ref(false);
const tempOrder = ref({});
const currentPage = ref(1);
const isNew = ref(false);

const orderModal = ref(null);
const delModal = ref(null);

function getOrders(page = 1) {
  currentPage.value = page;
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/orders?page=${page}`;
  isLoading.value = true;
  proxy.$http.get(url).then((response) => {
    orders.value = response.data.orders;
    pagination.value = response.data.pagination;
    isLoading.value = false;
    console.log(response);
  });
}

function openModal(_isNew, item) {
  tempOrder.value = { ...item };
  isNew.value = false;
  orderModal.value.showModal();
}

function openDelOrderModal(item) {
  tempOrder.value = { ...item };
  delModal.value.showModal();
}

function updatePaid(item) {
  isLoading.value = true;
  const api = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/order/${item.id}`;
  const paid = {
    is_paid: item.is_paid,
  };

  proxy.$http.put(api, { data: paid }).then((response) => {
    isLoading.value = false;
    getOrders(currentPage.value);
    proxy.$httpMessageState(response, "更新付款狀態");
  });
}

function delOrder() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/order/${tempOrder.value.id}`;
  isLoading.value = true;
  proxy.$http.delete(url).then((response) => {
    console.log(response);
    delModal.value.hideModal();
    getOrders(currentPage.value);
  });
}

function handleUpdateOrder(_order) {
  console.log("接收到更新的訂單：", _order);
  orderModal.value.hideModal();
  getOrders(currentPage.value);
}

onBeforeMount(() => {
  getOrders();
  console.log(process.env.VUE_APP_API);
});
</script>
