<template>
  <div id="commentForm">
    <div id="mentioned" ref="comment-mentioned-list">
      <div class="comment comment--mentioned"
           v-for="(user, index) in this.mentioned"
           v-bind:key="'mentioned-' + index"
           v-bind:class="{ 'comment--active': index === active }"
           @mouseenter="active = index"
           @mouseup="injectUser()">
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
               @keyup="textInjection($event)"
               @paste="textInjection($event)"
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
      mention: {
        text: null,
        index: null
      },
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
    clearMention() {
      this.mention = {
        text: null,
        index: null
      }
    },
    preventButtons (event) {
      if (event.ctrlKey || event.key === 'Shift' || event.key === 'Enter' || event.key === 'Control' || event.key === 'Alt' || (this.mentioned.length > 0 && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))) {
        return false
      } else {
        return true
      }
    },
    textInjection(event) {
      if (this.preventButtons(event)) {
        const CONTENTEDITABLE = this.$refs['comment-content-text']
        const selection = window.getSelection()
        const SELECTION_TEXT = selection.getRangeAt(0).endContainer
        let text = SELECTION_TEXT.textContent
        let caret = selection.getRangeAt(0).startOffset
        let iconsQuantity = 0
        if (SELECTION_TEXT.nodeName === '#text') {
          for (let i in this.icons) {
            text = text.replaceAll(this.icons[i].text, this.icons[i].emoticon)
            iconsQuantity += Array.from(text).filter((item) => item === this.icons[i].emoticon).length
          }
          if (text.includes('@')) {
            let textArray = Array.from(text);
            let mentions = textArray.reduce(function(arr, e, i) {
              if (e.includes('@')) arr.push(i);
              return arr;
            }, [])

            let a = 0
            while(mentions[++a] < caret);
            let index = mentions[--a]

            let mention = ''
            for (let i = index + 1; i < textArray.length; i++) {
              if (/[A-Za-z]/.test(textArray[i])) {
                mention += textArray[i]
              } else {
                break
              }
            }
            let end = index + mention.length + 1 + iconsQuantity
            if (caret >= index + iconsQuantity && caret <= end) {
              this.mention.text = mention
              this.mention.index = index + iconsQuantity
              this.mentioned = (mention.length > 0) ? this.users.filter((item) => {
                return (item.first_name.toUpperCase().includes(mention.toUpperCase()) && (mention.substring(0, 1).toUpperCase() === item.first_name.substring(0, 1).toUpperCase()))
                    || (item.last_name.toUpperCase().includes(mention.toUpperCase()) && (mention.substring(0, 1).toUpperCase() === item.last_name.substring(0, 1).toUpperCase()))
              }) : []
            } else {
              this.mentioned = []
            }
          } else if (this.mentioned.length > 0) {
            this.mentioned = []
          }

          SELECTION_TEXT.textContent = text
          let range = document.createRange()
          range.setStart(SELECTION_TEXT, caret)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
          this.$set(this.item, 'text', CONTENTEDITABLE.innerHTML)
        }
      }
    },
    injectUser() {
      let container = this.$refs['comment-content-text']
      let text = container.innerHTML
      let selection = window.getSelection()

      let user = this.mentioned[this.active]
      if (user) {
        user = Object.assign({}, user)
      }
      let mentionHTML = '<span id="current-mention" contentEditable="false">' + user.first_name + ' ' + user.last_name + '</span>'
      this.mentioned = []
      this.active = -1

      let firstPart = text.substring(0, this.mention.index)
      let lastPart = text.substring(this.mention.index, text.length)
      text = firstPart + lastPart.replace('@' + this.mention.text, mentionHTML)
      container.innerHTML = text
      this.clearMention()

      let spanText = document.getElementById('current-mention')
      let nextText = spanText.nextSibling
      if (!nextText) {
        nextText = document.createTextNode('')
        container.appendChild(nextText)
      }
      let range = document.createRange()
      range.setStart(nextText, 0)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      spanText.removeAttribute('id')
      this.$set(this.item, 'text', text.replaceAll('id="current-mention" contentEditable="false"', ''))
    },
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
    preventActions(event) {
      if (event.keyCode === 13) {
        event.preventDefault()
        if (this.mentioned.length === 0) {
          this.submitForm()
        } else if (this.active >= 0) {
          this.injectUser()
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
    }
  }
}
</script>
