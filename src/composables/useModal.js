import { ref, onMounted } from "vue";
import Modal from "bootstrap/js/dist/modal";

export function useModal() {
  const modal = ref(null);
  let modalInstance = null;

  onMounted(() => {
    modalInstance = new Modal(modal.value);
  });

  function showModal() {
    modalInstance?.show();
  }

  function hideModal() {
    modalInstance?.hide();
  }

  return { modal, showModal, hideModal };
}
