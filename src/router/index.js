import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    children:[
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/Products.vue')
      },
       {
        path: 'orders',
        component: () => import('../views/Orders.vue'),
      },
      {
        path: 'coupons',
        component: () => import('../views/Coupons.vue'),
      },
    ],
  },
  {
    path:'/user',
    component:() => import('../views/Userboard.vue'),
    children:[
       {
        path: 'cart',
        component: () => import('../views/UserCart.vue')
       },
       {
         path:'product/:productId',
         component: () => import('../views/UserProduct.vue')
       },
       {
         path: 'checkout/:orderId',
         component: () => import('../views/UserCheckout.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes
})

export default router
