<template>
  <div class="comment comment--show">
    <div class="comment__avatar">
      <img :src="item.avatar">
    </div>
    <div class="comment__content">
      <div class="comment__content--text">
        <b>{{ item.first_name }} {{ item.last_name }}:</b> <div v-html="item.text"></div>
      </div>
      <div class="comment__content--time">
        {{ createdAt }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Comment",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      createdAt: '',
      interval: null
    }
  },
  created() {
    // this.$bus.on('commentAdded', this.setTimeText)
    this.setTimeText()

  },
  beforeDestroy() {
    // this.$bus.off('commentAdded')
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    setTimeText() {
      let item = this.item
      if (item && item.created_at) {
        this.createdAt = this.$moment(this.$moment(item.created_at)).fromNow()
        // this.interval = setInterval(() => {
        //   this.setTimeText()
        // }, 3600)
      } else {
        this.createdAt = ''
      }
    }
  }
}
</script>

<style scoped>

</style>
