import {store} from './store.js'
import {Main, router} from './Main.js'

const app = Vue.createApp(Main);
app.use(router);
app.use(store);
app.mount('#app');