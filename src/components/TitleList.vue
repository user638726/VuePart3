<template>
  <div class="title-list-container">
    <h2>最新消息</h2>
    <ul>
      <li v-for="(post, index) in posts" :key="index">
        <a
          :href="getFirstLink(post)"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ post.postInfo.title }}
        </a>
      </li>
    </ul>

    <div v-if="error" style="color: red">
      錯誤：{{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleList',
  data() {
    return {
      files: [ 'nba_6501.json', 'nba_6502.json'],
      posts: [],
      error: null
    }
  },
  mounted() {
    this.loadAllJsonFiles()
  },
  methods: {
    async loadAllJsonFiles() {
      try {
        const fetchPromises = this.files.map(file =>
          fetch(file).then(res => {
            if (!res.ok) throw new Error(`${file} 載入失敗`)
            return res.json()
          })
        )

        const allData = await Promise.all(fetchPromises)

        allData.forEach(dataArray => {
          dataArray.forEach(item => {
            if (item.postInfo?.title) {
              this.posts.push(item)
            }
          })
        })
      } catch (err) {
        this.error = err.message
        alert('載入失敗：' + err.message)
      }
    },
    // 取得每篇文章的第一個連結，如果有的話
    getFirstLink(post) {
     const links = post.contentInfo?.link || []
     const imageLinks = post.contentInfo?.image || []

  // 過濾掉在 image 陣列中出現過的圖片連結
     const filtered = links.filter(link => !imageLinks.includes(link))

  // 回傳第一個非圖片的連結，如果沒有，就退回第一個 link 或 '#'
     return filtered[0] || links[0] || '#'
    }
  }
}
</script>

<style scoped>
ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}

a {
  color: #1e88e5;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.title-list-container {
  margin-bottom: 100px; /* 根據實際需要調整距離 */
}

</style>
