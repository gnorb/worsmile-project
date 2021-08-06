<template>
  <div id="app">
    <div class="card">
      <div v-if="comments" id="comments">
        <Comment v-for="(comment, index) in comments" v-bind:key="'comment-' + index" :item="comment"></Comment>
      </div>
      <CommentForm></CommentForm>
    </div>
  </div>
</template>

<script>

import { mapActions, mapState } from 'vuex'
import Comment from './components/Comment'
import CommentForm from './components/CommentForm'
export default {
  name: 'App',
  components: {
    Comment,
    CommentForm
  },
  computed: {
    ...mapState({
      comments: state => state.comments
    }),
  },
  created() {
    this.getComments()
  },
  watch: {
    'comments': {
      handler: function (val, oldVal) {
        if (oldVal) {
          this.$bus.emit('commentAdded')
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapActions(['getComments']),
  }
}
</script>

<style lang="sass">
  @import 'assets/sass/style.scss'
</style>
