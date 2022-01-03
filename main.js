// Main.js
import About from './About.js'
import News from './News.js'


// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', name: 'default', component: About },
  { path: '/about', name: 'about', component: About },
  { path: '/news', name: 'news', component: News },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes, // short for `routes: routes`
})



const Main = {
  data() {
    return {
      message: 'You Loaded this page on ' + new Date().toLocaleString()
    }
  },
  methods: {
    isPaneActive(name) {
      return this.$route.name == name
    }
  },
  computed: {
  },

  template: `
    <div class=boyan>
      <div v-if="isPaneActive('default')" id="idDefaultPane" class="verticalPane"> default <router-view></router-view> </div>
      <div v-else id="idDefaultPaneShrinked" class="verticalPane"> <router-link to="/">DEFAULT</router-link> </div>

      <div v-if="isPaneActive('about')" id="idAboutPane" class="verticalPane"> about <router-view></router-view> </div>
      <div v-else id="idAboutPaneShrinked" class="verticalPane"> <router-link to="/about">ABOUT</router-link> </div>

      <div v-if="isPaneActive('news')" id="idNewsPane" class="verticalPane"> news <router-view></router-view> </div>
      <div v-else id="idNewsPaneShrinked" class="verticalPane"> <router-link to="/news">NEWS</router-link> </div>
    </div>
  `,
}


export { Main, router } 