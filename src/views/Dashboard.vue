<template>
  <Navbar />
  <div class="container-fluid mt-3 position-relative">
    <ToastMessages />
    <RouterView />
  </div>
</template>

<script setup>
import { getCurrentInstance, onBeforeMount, provide } from "vue";
import { useRouter } from "vue-router";
import emitter from "@/methods/emitter";
import ToastMessages from "@/components/ToastMessages.vue";
import Navbar from "../components/Navbar.vue";

provide("emitter", emitter);

const router = useRouter();
const { proxy } = getCurrentInstance();

onBeforeMount(() => {
  const Token = document.cookie.replace(
    /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
  proxy.$http.defaults.headers.common.Authorization = `${Token}`;
  const api = `${process.env.VUE_APP_API}api/user/check`;
  proxy.$http.post(api).then((res) => {
    if (!res.data.success) {
      router.push("/login");
    }
  });
});
</script>
