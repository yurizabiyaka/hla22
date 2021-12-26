// Main.js
export default {

    data() {
      return {
        message: 'You Loaded this page on ' + new Date().toLocaleString()
      }
    },
    template: `<button> {{ message }}  </button> <p> <button-counter></button-counter>`
}
  
