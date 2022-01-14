// Main.js
import {Default, DefaultShrinked} from './Default.js'
import {Login, LoginShrinked} from './Login.js'
import {MyPosts, MyPostsShrinked} from './MyPosts.js'
import {About, AboutShrinked} from './About.js'
//import {News, NewsShrinked} from './News.js'
import { SearchUsers, SearchUsersShrinked } from './SearchUsers.js'

import { store } from "./store.js"

const routes = [
  { path: '/', name: 'login', component: Login, },
  { path: '/logout', name: 'logout', redirect: { name: 'login' } }, // this prevents Main to be recreated on logout
  { path: '/myposts', name: 'myposts', component: MyPosts , meta: {  requiresAuth: true, } },
  // { path: '/news', name: 'news', component: News, meta: {  requiresAuth: true, }  },
  { path: '/about', name: 'about', component: About },
  { path: '/search_users', name: 'search_users', component: SearchUsers },
]

// TODO: how to set a default route
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(path => path.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath } // добавляется метаинформация куда потом идти
      })
    } else {
      next()
    }
  } else {
    next() // всегда так или иначе нужно вызвать next()!
  }
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
    'pane-login-shrinked': LoginShrinked,
    'pane-myposts-shrinked': MyPostsShrinked,
    //'pane-news-shrinked': NewsShrinked,
    'pane-about-shrinked':AboutShrinked,
    'pane-search-users-shrinked': SearchUsersShrinked,
  },
  created() {
    this.$store.dispatch('loginByCreds')
  },
  methods: {
    isPaneActive(name) {
      if (typeof this.$route.name !== 'undefined') {
        return this.$route.name == name
      }
      if (name === 'login') return true;
      return false
    }
  },
  computed: {
  },

  template: `
    <div class=boyan>
      <div v-if="isPaneActive('login')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-login-shrinked></pane-login-shrinked></div>
      
      <div v-if="isPaneActive('myposts')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-myposts-shrinked></pane-myposts-shrinked></div>
  
      <div v-if="isPaneActive('search_users')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-search-users-shrinked></pane-search-users-shrinked> </div>
      
      <div v-if="isPaneActive('about')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-about-shrinked></pane-about-shrinked> </div>
    </div>
  `,
}


export { Main, router } 