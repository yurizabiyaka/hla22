// MyPosts.js
import MyPost from "./MyPost.js"

const MyPosts = {
    data() {
        return {
            newText: "",
        }
    },
    created() {
        console.log('MYPOSTS created')
        this.$store.dispatch('loadMyPosts')
    },
    // beforeUpdate(){
    //     console.log('MYPOSTS before update')
    // },
    // beforeUnmount(){
    //     console.log('MYPOSTS before unmount')
    // },
    computed: {
        myPosts() {
            return this.$store.getters.myposts
        }
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault()
            if (this.newText.length > 0) {
                this.$store.dispatch('submitNewPost', { text: this.newText })
                .then(response => {
                    this.newText = ""
                })
                .catch(function (error) {
                    console.error(error);
                });
            }
        },
    },
    components: {
        'my-post': MyPost
    },
    template: `
    <div class="myPostsPane">
    <h1> MYPOSTS </h1>
    <form>
       <div>
        <textarea id="newtext" v-model="newText" required autofocus placeholder="Describe your feelings..."/>
      </div>
      <div>
        <button type="submit" @click="handleSubmit">
          Share
        </button>
      </div>
    </form>
         <!--- <div v-for="post in myPosts">  -->
            <table>
                <my-post v-for="post in myPosts"
                    :postData="post" 
                ></my-post>
            </table>
        <!--- </div>  -->
    </div>`
}

const MyPostsShrinked = {
    created() {
    },
    computed: {
        totalMyPosts() {
            return this.$store.getters.myposts && this.$store.getters.myposts.length || 0
        }
    },
    template: `
    <div class="myPostsPaneShrinked">
    <router-link to="/myposts">MYPOSTS</router-link>
    <table>
        <tr>
            <td>Total posts:</td>
            <td> {{ totalMyPosts }} </td>
        </tr>
    </table>
    </div>`
}

export {MyPosts, MyPostsShrinked}