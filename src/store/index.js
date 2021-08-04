import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    comments: null,
    user: {
      first_name: 'John',
      last_name: 'Doe',
      avatar: 'https://randomuser.me/api/portraits/men/79.jpg'
    },
    users: null,
    icons: [
      {
        text: ':D',
        emoticon: '😄'
      },
      {
        text: 'XD',
        emoticon: '😆'
      },
      {
        text: ':)',
        emoticon: '🙂'
      },
      {
        text: ':P',
        emoticon: '😛'
      },
      {
        text: ':*',
        emoticon: '😚'
      },
      {
        text: ':(',
        emoticon: '😟'
      },
      {
        text: ':/',
        emoticon: '😕 '
      },
      {
        text: ';(',
        emoticon: '😢 '
      }
    ]
  },
  mutations: {
    setComments (state, result) {
      state.comments = result
    },
    setUsers (state, result) {
      state.users = result
    },
    addComment (state, result) {
      state.comments.push(result)
    }
  },
  actions: {
    async getComments (context) {
      const result = await Vue.prototype.$axios.get('/data/comments.json')
      if (result.data && result.data.data) {
        context.commit('setComments', result.data.data)
      }
    },
    async getUsers (context) {
      const result = await Vue.prototype.$axios.get('https://reqres.in/api/users')
      if (result.data && result.data.data) {
        context.commit('setUsers', result.data.data)
      }
    },
    addComment (context, data) {
      context.commit('addComment', data)
    }
  },
  modules: {
  }
})
