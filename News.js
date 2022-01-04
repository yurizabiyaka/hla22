// News.js
import NewsPost from './NewsPost.js'

const News = {
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
    data() {
        return {
            newMessagesCount: 0,
        }
    },
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
    <tr> <td>New messages:</td> <td>{{ newMessagesCount }}</td> </tr>
    </table>
    </div>
    `
}

export {News, NewsShrinked}