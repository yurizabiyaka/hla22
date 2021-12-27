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
    <p> <news></news> </p>
    </div>
    `,
}