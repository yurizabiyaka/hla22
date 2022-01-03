// News.js
import NewsPost from './NewsPost.js'

export default {
    data() {
        return {
            news: [
                { id: 1, from: 'Author The King', text: 'My journey with Vue', likes: 10, iLike: true, },
                { id: 2, from: 'Bilbo', text: 'Blogging with Vue', likes: 12, iLike: true,  },
                { id: 3, from: 'Eleonor', text: 'Why Vue is so fun', likes: 6, iLike: false,  },
            ]
        }
    },
    methods: {
        changeILikeForPost(postId) {
            const postIdx = this.news.findIndex(function(element, index, array){
                return element.id===postId
            })
            if (postIdx >= 0) {
                this.news[postIdx].iLike = this.news[postIdx].iLike ? false : true
            }
         }
    },

    components: {
        'news-post': NewsPost
    },

    template: `
    <div>
        <router-link to="/">Default</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/news">News</router-link>
    </div>
    <div>
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