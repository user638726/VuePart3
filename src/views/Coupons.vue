<template>
  <div>
    <Loading :active="isLoading"></Loading>
    <div class="text-end mt-4">
      <button class="btn btn-primary" @click="openCouponModal(true)">
        建立新的優惠券
      </button>
    </div>
    <table class="table mt-4">
      <thead>
        <tr>
          <th>名稱</th>
          <th>折扣百分比</th>
          <th>到期日</th>
          <th>是否啟用</th>
          <th>編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, key) in coupons" :key="key">
          <td>{{ item.title }}</td>
          <td>{{ item.percent }}%</td>
          <td>{{ $filters.date(item.due_date) }}</td>
          <td>
            <span v-if="item.is_enabled === 1" class="text-success">啟用</span>
            <span v-else class="text-muted">未起用</span>
          </td>
          <td>
            <div class="btn-group">
              <button
                class="btn btn-outline-primary btn-sm"
                @click="openCouponModal(false, item)"
              >
                編輯
              </button>
              <button
                class="btn btn-outline-danger btn-sm"
                @click="openDelCouponModal(item)"
              >
                刪除
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <CouponModal
      :coupon="tempCoupon"
      ref="couponModal"
      @update-coupon="updateCoupon"
    />
    <DelModal :item="tempCoupon" ref="delModal" @del-item="delCoupon" />
  </div>
</template>

<script setup>
import { getCurrentInstance, onBeforeMount, ref } from "vue";
import CouponModal from "@/components/CouponModal.vue";
import DelModal from "@/components/DelModal.vue";

const { proxy } = getCurrentInstance();

defineProps({
  config: Object,
});

const coupons = ref({});
const tempCoupon = ref({
  title: "",
  is_enabled: 0,
  percent: 100,
  code: "",
});
const isLoading = ref(false);
const isNew = ref(false);

const couponModal = ref(null);
const delModal = ref(null);

function openCouponModal(newFlag, item) {
  isNew.value = newFlag;
  if (isNew.value) {
    tempCoupon.value = { due_date: Date.now() / 1000 };
  } else {
    tempCoupon.value = { ...item };
  }
  couponModal.value.showModal();
}

function openDelCouponModal(item) {
  tempCoupon.value = { ...item };
  delModal.value.showModal();
}

function getCoupons() {
  isLoading.value = true;
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/coupons`;
  proxy.$http.get(url).then((response) => {
    coupons.value = response.data.coupons;
    isLoading.value = false;
  });
}

function updateCoupon(tempCouponParam) {
  if (isNew.value) {
    const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/coupon`;
    proxy.$http.post(url, { data: tempCouponParam }).then((response) => {
      proxy.$httpMessageState(response, "新增優惠券");
      getCoupons();
      couponModal.value.hideModal();
    });
  } else {
    const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/coupon/${tempCouponParam.id}`;
    proxy.$http.put(url, { data: tempCouponParam }).then((response) => {
      proxy.$httpMessageState(response, "更新優惠券");
      getCoupons();
      couponModal.value.hideModal();
    });
  }
}

function delCoupon() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/coupon/${tempCoupon.value.id}`;
  isLoading.value = true;
  proxy.$http.delete(url).then((response) => {
    proxy.$httpMessageState(response, "刪除優惠券");
    delModal.value.hideModal();
    getCoupons();
  });
}

onBeforeMount(() => {
  getCoupons();
});
</script>
