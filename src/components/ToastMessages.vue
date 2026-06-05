<template>
  <div class="toast-container position-absolute pe-3 top-0 end-0">
    <Toast v-for="(msg, key) in messages" :key="key" :msg="msg" />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from "vue";
import Toast from "@/components/Toast.vue";

const messages = ref([]);
const emitter = inject("emitter");

onMounted(() => {
  emitter.on("push-message", (message) => {
    const { style = "success", title, content } = message;
    messages.value.push({ style, title, content });
  });
});
</script>
