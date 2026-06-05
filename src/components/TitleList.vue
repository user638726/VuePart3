<template>
  <div class="title-list-container">
    <h2 class="fw-bold text-center mb-4">最新消息</h2>

    <!-- 外層灰底 -->
    <div class="news-box">
      <!-- 內層白底清單 -->
      <ul class="news-list">
        <li
          v-for="(post, index) in limitedPosts"
          :key="index"
          class="news-item"
        >
          <a
            :href="getFirstLink(post)"
            target="_blank"
            rel="noopener noreferrer"
            class="news-title"
          >
            {{ post.postInfo.title }}
          </a>
        </li>
      </ul>

      <!-- 🔹 查看更多按鈕放在灰色底內 -->
      <div class="text-center mt-3">
        <router-link to="/news" class="btn btn-dark">
          查看更多
        </router-link>
      </div>
    </div>

    <div v-if="error" style="color: red" class="mt-3">
      錯誤：{{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const files = ["nba01.json"];
const posts = ref([]);
const error = ref(null);

const limitedPosts = computed(() => posts.value.slice(0, 5));

async function loadAllJsonFiles() {
  try {
    const fetchPromises = files.map((file) =>
      fetch(file).then((res) => {
        if (!res.ok) throw new Error(`${file} 載入失敗`);
        return res.json();
      })
    );

    const allData = await Promise.all(fetchPromises);

    allData.forEach((dataArray) => {
      dataArray.forEach((item) => {
        if (item.postInfo?.title && item.postInfo.title !== "unknown") {
          posts.value.push(item);
        }
      });
    });
  } catch (err) {
    error.value = err.message;
    alert("載入失敗：" + err.message);
  }
}

function getFirstLink(post) {
  const links = post.contentInfo?.link || [];
  const imageLinks = post.contentInfo?.image || [];
  const filtered = links.filter((link) => !imageLinks.includes(link));
  return filtered[0] || links[0] || "#";
}

onMounted(() => {
  loadAllJsonFiles();
});
</script>

<style scoped>
.title-list-container {
  margin-top: 100px; /* 與上方 hero 區塊距離 */
  margin-bottom: 70px;
  max-width: 1500px; /* ✅ 限制區塊最大寬度 */
  margin-left: auto;
  margin-right: auto;
}


/* 灰色外框 */
.news-box {
  background: #F0F0F0;
  border-radius: 6px;
  padding: 20px;
}

/* 白底清單 */
.news-list {
  background: #ffffff;
  border-radius: 4px;
  padding: 15px;
  margin: 0;
  list-style: none;
}

/* 單一項目 */
.news-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.news-item:last-child {
  border-bottom: none;
}

/* 文字樣式 */
:deep(.news-title) {
  color: #000;
  text-decoration: none;
}
:deep(.news-title:visited) {
  color: #000;
}
:deep(.news-title:hover),
:deep(.news-title:visited:hover) {
  color: #1e88e5 !important;
  text-decoration: underline;
}
</style>
