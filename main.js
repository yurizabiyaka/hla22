

const RootComponent = {
    data() {
      return {
        message: 'You loaded this page on ' + new Date().toLocaleString()
      }
    },
    template: `<button> {{ message }}  </button>`
}
  
Vue.createApp(RootComponent).mount('#app')