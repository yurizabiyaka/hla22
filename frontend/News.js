// News.js
import NewsPost from './NewsPost.js'

const News = {
    data(){
        return {
            requestFrom: 0,
            requestQuant: 1,
            news: [],
       }
    },
    created() {
        const lastResults = this.$store.getters.lastNewsResults;
        this.requestFrom = lastResults.from;
        this.requestQuant = lastResults.quantity;
        this.news = lastResults.results;
    },
    methods: {
        changeILikeForPost(postId) {
            this.$store.commit('changeILikeForPostID', postId)
        },
        infiniteHandler(state) {
                this.$store.dispatch('loadNews', {
                    from: this.requestFrom,
                    quantity: this.requestQuant
                })
                .then((answer)=> {
                    if (answer.failed) {
                        alert(answer.error_message)
                        state.error();
                    } else {
                        if (answer.news && answer.news.length) {
                            this.requestFrom += answer.news.length;
                            this.news.push(...answer.news);
                            this.$store.commit('setLastNewsResults', {
                                from: this.requestFrom,
                                quantity: this.requestQuant,
                                results: this.news
                            })
                            state.loaded();
                        } else {
                            state.complete();
                        }
                    }
                })
        },
        changeMode(mode){
            this.$store.commit('setPaneMode', {group: 'posts', mode: mode})
        },
    },

    components: {
        'news-post': NewsPost,
        'infinite-loading': InfiniteLoadingVue3Ts,
    },

    template: `
    <div class="newsPane">
        <table width=100%><tr>
            <td><router-link to="/myposts" @click="changeMode('/myposts');">MY POSTS</router-link> </td>
            <td><h1> News </h1> </td>
        </tr></table>
        <table width=100%>
            <news-post v-for="post in news" @change-like="changeILikeForPost"
                :initialPost="post"
                :mode="'news'" 
                :key="post.id" 
                />
        </table>
        <infinite-loading  @infinite="infiniteHandler"> 
            <template #no-more>no more data</template>
        </infinite-loading>
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