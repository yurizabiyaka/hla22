import Main from './Main.js'
import Stuff from './Stuff.js'

const app = Vue.createApp(Main)
app.component('button-counter', Stuff)
app.mount('#app')