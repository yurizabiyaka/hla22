import {Main, router} from './Main.js'

const app = Vue.createApp(Main);
app.use(router);
app.mount('#app');