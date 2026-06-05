<template>
  <loading :active="isLoading"></loading>
  <div class="text-end">
    <button class="btn btn-primary" type="button" @click="openModal(true)">
      增加一個產品
    </button>
  </div>
  <table class="table mt-4">
    <thead>
      <tr>
        <th width="120">分類</th>
        <th>產品名稱</th>
        <th width="120">原價</th>
        <th width="120">售價</th>
        <th width="100">是否啟用</th>
        <th width="200">編輯</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in products" :key="item.id">
        <td>{{ item.category }}</td>
        <td>{{ item.title }}</td>
        <td class="text-right">
          {{ currency(item.origin_price) }}
        </td>
        <td class="text-right">
          {{ currency(item.price) }}
        </td>
        <td>
          <span class="text-success" v-if="item.is_enabled">啟用</span>
          <span class="text-muted" v-else>未啟用</span>
        </td>
        <td>
          <div class="btn-group">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="openModal(false, item)"
            >
              編輯
            </button>
            <button
              class="btn btn-outline-danger btn-sm"
              @click="openDelProductModal(item)"
            >
              刪除
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <Pagination :pages="pagination" @emit-pages="getProducts"></Pagination>
  <ProductModal
    ref="productModal"
    :product="tempProduct"
    @update-product="updateProduct"
  ></ProductModal>
  <DelModal :item="tempProduct" ref="delModal" @del-item="delProduct" />
</template>

<script setup>
import { ref, inject, onBeforeMount, getCurrentInstance } from "vue";
import ProductModal from "../components/ProductModal.vue";
import DelModal from "@/components/DelModal.vue";
import Pagination from "@/components/Pagination.vue";
import { currency } from "@/methods/filters";

const emitter = inject("emitter");
const { proxy } = getCurrentInstance();

const products = ref([]);
const pagination = ref({});
const tempProduct = ref({});
const isNew = ref(false);
const isLoading = ref(false);
const productModal = ref(null);
const delModal = ref(null);

function getProducts(page = 1) {
  const api = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/products/?page=${page}`;
  isLoading.value = true;
  proxy.$http.get(api).then((res) => {
    isLoading.value = false;
    if (res.data.success) {
      products.value = res.data.products;
      pagination.value = res.data.pagination;
    }
  });
}

function openModal(newItem, item) {
  if (newItem) {
    tempProduct.value = {};
  } else {
    tempProduct.value = { ...item };
  }
  isNew.value = newItem;
  productModal.value.showModal();
}

function updateProduct(item) {
  tempProduct.value = item;
  let api = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/product`;
  let httpMethod = "post";
  if (!isNew.value) {
    api = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/product/${item.id}`;
    httpMethod = "put";
  }
  proxy.$http[httpMethod](api, { data: tempProduct.value }).then((response) => {
    productModal.value.hideModal();
    if (response.data.success) {
      getProducts();
      emitter.emit("push-message", {
        style: "success",
        title: "更新成功",
      });
    } else {
      emitter.emit("push-message", {
        style: "danger",
        title: "更新失敗",
        content: response.data.message.join("、"),
      });
    }
  });
}

function openDelProductModal(item) {
  tempProduct.value = { ...item };
  delModal.value.showModal();
}

function delProduct() {
  const url = `${process.env.VUE_APP_API}api/${process.env.VUE_APP_PATH}/admin/product/${tempProduct.value.id}`;
  proxy.$http.delete(url).then(() => {
    delModal.value.hideModal();
    getProducts();
  });
}

onBeforeMount(() => {
  getProducts();
});
</script>
