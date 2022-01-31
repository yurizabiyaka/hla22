import {store} from './store.js'
import {Main, router} from './Main.js'

const app = Vue.createApp(Main);
app.use(router);
app.use(store);
app.use(InfiniteLoadingVue3Ts);
app.mount('#app');