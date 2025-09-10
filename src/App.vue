<template>
  <div id="app">
    <RouterView />
    <footer class="bg-dark text-white text-center py-3">
      <p>&copy; 2025 籃球瘋. All rights reserved.</p>
    </footer>
  </div>
</template>

<style lang="scss">
@import "./assets/all.scss";

/* 全域 reset */
html, body {
  scroll-behavior: smooth;
  background-color: #ffffe0;
  height: 100%;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 撐滿整個畫面高度 */
}

footer {
  margin-top: auto; /* 把 footer 推到底 */
}

/* 統一 navbar 高度 (桌機大多是 56px) */
:root {
  --nav-height: 56px;
}

/* 需要避開 navbar 的內文區塊才加這個 class */
.content-offset {
  padding-top: var(--nav-height);
}
/* 放在 src/assets/all.scss 或 App.vue 的 global style */
a.news-title,
.news-list a.news-title,
.news-title {
  color: #000 !important;
  text-decoration: none !important;
}

/* visited 也維持黑色 */
a.news-title:visited,
.news-title:visited {
  color: #000 !important;
}

/* hover（不論是否 visited）變藍 */
a.news-title:hover,
.news-title:hover,
a.news-title:focus,
.news-title:focus,
a.news-title:visited:hover {
  color: #1e88e5 !important;
  text-decoration: underline !important;
  font-weight: 600 !important;
}

</style>
