// Main.js
import {Default, DefaultShrinked} from './Default.js'
import {About, AboutShrinked} from './About.js'
import {News, NewsShrinked} from './News.js'


// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', name: 'default', component: Default },
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

router.afterEach((to, from) => {
  if (typeof from !== 'undefined') {
    console.log(from.name , '->' , to.name)
  } else {
    console.log('undefined' , '->' , to.name)
  } 
})

const Main = {
  components: {
    'pane-default-shrinked': DefaultShrinked,
    'pane-about-shrinked':AboutShrinked,
    'pane-news-shrinked': NewsShrinked,
  },
  methods: {
    isPaneActive(name) {
      if (typeof this.$route !== 'undefined') {
        return this.$route.name == name
      } else {
        return false
      }
    }
  },
  computed: {
  },

  template: `
    <div class=boyan>
      <div v-if="isPaneActive('default')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-default-shrinked></pane-default-shrinked></div>
      
      <div v-if="isPaneActive('about')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-about-shrinked></pane-about-shrinked> </div>
 
      <div v-if="isPaneActive('news')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-news-shrinked></pane-news-shrinked> </div>

    </div>
  `,
}


export { Main, router } 