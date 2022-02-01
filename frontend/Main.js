// Main.js
import {Default, DefaultShrinked} from './Default.js'
import {Login, LoginShrinked} from './Login.js'
import {MyPosts, MyPostsShrinked} from './MyPosts.js'
import {News, NewsShrinked} from './News.js'
import { SearchUsers, SearchUsersShrinked } from './SearchUsers.js'
import { FriendList, FriendListShrinked } from './FriendList.js'
import { FriendRequests, FriendRequestsShrinked } from './FriendRequests.js'
import {About, AboutShrinked} from './About.js'

import { store } from "./store.js"

const routes = [
  { path: '/', name: 'login', component: Login, },
  { path: '/logout', name: 'logout', redirect: { name: 'login' } }, // this prevents Main to be recreated on logout
  { path: '/myposts', name: 'myposts', component: MyPosts , meta: {  requiresAuth: true, } },
  { path: '/search_users', name: 'search_users', component: SearchUsers, meta: {  requiresAuth: true, } },
  { path: '/friend_list', name: 'friendlist', component: FriendList, meta: {  requiresAuth: true, } },
  { path: '/friend_requests', name: 'friendrequests', component: FriendRequests, meta: {  requiresAuth: true, } },
  { path: '/news', name: 'news', component: News, meta: {  requiresAuth: true, }  },
  { path: '/about', name: 'about', component: About },
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
    'pane-news-shrinked': NewsShrinked,
    'pane-search-users-shrinked': SearchUsersShrinked,
    'pane-friendlist-shrinked': FriendListShrinked,
    'pane-friendrequests-shrinked': FriendRequestsShrinked,
    'pane-about-shrinked': AboutShrinked,
  },
  created() {
    this.$store.dispatch('loginByCreds')
  },
  computed: {
    friendMode(){
      let curmode = this.$store.getters.getPaneMode("friends")
      return curmode
    },
    postsMode(){
      let curmode = this.$store.getters.getPaneMode("posts")
      return curmode
    },
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
  template: `
    <div class=boyan>
      <div v-if="isPaneActive('login')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-login-shrinked></pane-login-shrinked></div>
      
      <div      v-if="isPaneActive('myposts')" class="activePane"> <router-view></router-view> </div>
      <div v-else-if="isPaneActive('news')" class="activePane"> <router-view></router-view> </div>
      <div v-else-if="postsMode === '/news'" class="paneShrinked"> <pane-news-shrinked></pane-news-shrinked> </div>
      <div v-else class="paneShrinked"> <pane-myposts-shrinked></pane-myposts-shrinked></div>
  
      <div v-if="isPaneActive('search_users')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-search-users-shrinked></pane-search-users-shrinked> </div>
      
      <div      v-if="isPaneActive('friendlist')" class="activePane"> <router-view></router-view> </div>
      <div v-else-if="isPaneActive('friendrequests')" class="activePane"> <router-view></router-view> </div>
      <div v-else-if="friendMode === '/friend_list'" class="paneShrinked"> <pane-friendlist-shrinked></pane-friendlist-shrinked> </div>
      <div v-else class="paneShrinked"> <pane-friendrequests-shrinked></pane-friendrequests-shrinked> </div>

      <div v-if="isPaneActive('about')" class="activePane"> <router-view></router-view> </div>
      <div v-else class="paneShrinked"> <pane-about-shrinked></pane-about-shrinked> </div>

      <!--
      -->
    </div>
  `,
}


export { Main, router } 