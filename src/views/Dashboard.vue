<template>
   <Navbar></Navbar>
    <div class="container-fluid mt-3 position-relative">
    <ToastMessages></ToastMessages>
    <RouterView />
   </div>
</template>

<script>
import emitter from '@/methods/emitter';
import ToastMessages from '@/components/ToastMessages.vue';
import Navbar from '../components/Navbar.vue';
export default {
  components: {
    Navbar,
    ToastMessages,
  },
  provide(){
     return{
       emitter,
     };
  },
 created(){
    const Token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    console.log(Token);
    this.$http.defaults.headers.common.Authorization = `${Token}`;
    const api = `${process.env.VUE_APP_API}api/user/check`;
      this.$http.post(api, this.user)
      .then((res)=>{
        console.log(res);
        if(!res.data.success) {
          this.$router.push('/login');
        }
      });
  },
};
</script>