// Main.js
import News from './News.js'

export default {
    data() {
      return {
        message: 'You Loaded this page on ' + new Date().toLocaleString()
      }
    },

    components: {
      'news': News
    },

    template: `<div>
    <button> {{ message }}  </button>
    <p> <button-counter> </button-counter> </p>
    <p> <news></news> </p>
    </div>
    `,
}