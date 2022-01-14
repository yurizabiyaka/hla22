// News.js
import NewsPost from './NewsPost.js'

const News = {
    computed:{
        news() {
            return this.$store.getters.news
        }
    },
    methods: {
        changeILikeForPost(postId) {
            this.$store.commit('changeILikeForPostID', postId)
        }
    },

    components: {
        'news-post': NewsPost
    },

    created() {
        console.log('NEWS created')
    },
    beforeUpdate(){
        console.log('NEWS before update')
    },
    beforeUnmount(){
        console.log('NEWS before unmount')
    },
    template: `
    <div class="newsPane">
        <div v-for="post in news">
            <news-post @change-like="changeILikeForPost"
                :id="post.id"
                :from="post.from"
                :text="post.text"
                :likes="post.likes" 
                :iLike="post.iLike" 
            ></news-post>
        </div>
    </div>`,
}

const NewsShrinked = {
    created() {
        console.log('NEWS SHRINKED created')
    },
    beforeUpdate(){
        console.log('NEWS SHRINKED before update')
    },
    beforeUnmount(){
        console.log('NEWS SHRINKED before unmount')
    },
   template: `
    <div class="newsPaneShrinked">
    <router-link to="/news">NEWS</router-link>
    <table>
    <tr> <td>New messages:</td> <td> </td> </tr>
    </table>
    </div>
    `
}

export {News, NewsShrinked}