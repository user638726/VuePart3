<template>
  <div
    class="toast"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    ref="toastEl"
  >
    <div class="toast-header">
      <span
        :class="`bg-${msg.style}`"
        class="p-2 rounded me-2 d-inline-block"
      ></span>
      <strong class="me-auto">{{ msg.title }}</strong>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
    <div class="toast-body" v-if="msg.content">
      {{ msg.content }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Toast from "bootstrap/js/dist/toast";

defineProps(["msg"]);

const toastEl = ref(null);

onMounted(() => {
  const toast = new Toast(toastEl.value, {
    delay: 6000,
  });
  toast.show();
});
</script>
