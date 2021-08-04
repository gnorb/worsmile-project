<template>
  <div id="commentForm">
    <div id="mentioned" ref="comment-mentioned-list">
      <div class="comment comment--mentioned"
           v-for="(user, index) in this.mentioned"
           v-bind:key="'mentioned-' + index"
           v-bind:class="{ 'comment--active': index === active }"
           @mouseenter="active = index"
           @mouseup="getMentionedUser()">
        <div class="comment__avatar">
          <img :src="user.avatar">
        </div>
        <div class="comment__content">
          <div class="comment__content--userdata">
            <b>{{ user.first_name }} {{ user.last_name }}</b>
          </div>
        </div>
      </div>
    </div>
    <form @submit.prevent="submitForm($event)">
      <div class="comment comment--form">
        <div class="comment__avatar">
          <img :src="user.avatar">
        </div>
        <div class="comment__content">
          <div class="comment__content--text"
               contenteditable
               @keydown="preventActions($event)"
               @keyup="updateText()"
               @paste="updateText()"
               spellcheck="false"
               ref="comment-content-text"></div>
        </div>
        <div class="comment__button">
          <button>Opublikuj</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
export default {
  name: "CommentForm",
  data() {
    return {
      item: {
        text: ''
      },
      mentioned: [],
      active: -1
    }
  },
  computed: {
    ...mapState({
      comments: state => state.comments,
      icons: state => state.icons,
      user: state => state.user,
      users: state => state.users
    }),
  },
  created() {
    this.getUsers()
    this.$bus.on('commentAdded', this.clearTextarea)
  },
  beforeDestroy() {
    this.$bus.off('commentAdded')
  },
  methods: {
    ...mapActions(['getUsers', 'addComment']),
    submitForm(event = null) {
      if (event) event.preventDefault()
      if (this.item.text.length > 0) {
        let comment = Object.assign({}, this.item)
        comment.avatar = this.user.avatar
        comment.last_name = this.user.last_name
        comment.first_name = this.user.first_name
        comment.created_at = this.$moment().format('YYYY-MM-DD HH:mm:ss')
        this.addComment(comment)
      }
    },
    clearTextarea() {
      this.item.text = ''
      this.$refs['comment-content-text'].innerHTML = ''
    },
    getMentionedUser() {
      let user = this.mentioned[this.active]
      if (user) {
        user = Object.assign({}, user)
      }
      this.mentioned = []
      this.active = -1
      console.log(user)
      let textarea = this.$refs['comment-content-text'].firstChild
      let text = textarea.data.replace('<br>', '')
      let arrayText = text.split(" ")
      let caret = window.getSelection().getRangeAt(0).endOffset
      text = text.replace(arrayText[arrayText.findIndex((item) => item.includes('@'))], '<span>' + user.first_name + ' ' + user.last_name + '</span> ')
      // textarea.parentElement.innerHTML = text
      textarea.data = text
      this.$set(this.item, 'text', text)
      let range = document.createRange()
      console.log(textarea)
      range.setStart(textarea, caret)
      range.setEnd(textarea, caret)
      let sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    },
    preventActions(event) {
      if (event.keyCode === 13) {
        event.preventDefault()
        if (this.mentioned.length === 0) {
          this.submitForm()
        } else if (this.active >= 0) {
          this.getMentionedUser()
        }
      } else if ((event.keyCode === 38 || event.keyCode === 40) && this.mentioned.length > 0) {
        event.preventDefault()
        if (this.active >= 0) {
          if (event.keyCode === 38 && this.active > 0) {
            this.active--
          } else if (event.keyCode === 40) {
            if (this.active + 1 === this.mentioned.length) {
              this.active = -1
            } else {
              this.active++
            }
          }
        } else if (event.keyCode === 38) {
          this.active = this.mentioned.length - 1
        }
      }
    },
    updateText() {
      let textarea = this.$refs['comment-content-text'].firstChild
      // console.log(textarea.parentElement)
      if (textarea) {
        let oldText = this.item.text
        let text = textarea.data.replaceAll('<div>', '').replaceAll('</div>', '').replaceAll('<>', '')
        console.log(text)
        this.$set(this.item, 'text', text)
        if (oldText !== text) {
          let caret = window.getSelection().getRangeAt(0).endOffset
          console.log(caret)
          for (let i in this.icons) {
            text = text.replaceAll(this.icons[i].text, this.icons[i].emoticon)
          }
          if (text.includes('@')) {
            let mention = text.split(" ").filter((item) => item.includes('@'))[0].replaceAll(' ', '').replaceAll('@', '')
            this.mentioned = (mention.length > 0) ? this.users.filter((item) => {
              return (item.first_name.toUpperCase().includes(mention.toUpperCase()) && (mention.substring(0, 1).toUpperCase() === item.first_name.substring(0, 1).toUpperCase()))
                  || (item.last_name.toUpperCase().includes(mention.toUpperCase()) && (mention.substring(0, 1).toUpperCase() === item.last_name.substring(0, 1).toUpperCase()))
            }) : []
          } else if (this.mentioned.length > 0) {
            this.mentioned = []
          }
          textarea.data = text
          // textarea.innerHTML = '<div>' + text + '</div>'
          let range = document.createRange()
          range.setStart(textarea, caret)
          range.setEnd(textarea, caret)
          let sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }
    }
  }
}
</script>
