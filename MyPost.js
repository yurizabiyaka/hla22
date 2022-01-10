// MyPost.js
export default {
    props: {
        postData: Object,
    },
    // emits: ['changeLike'],
    // created() {
    //     console.log('MYPOST created')
    // },
    // beforeUpdate(){
    //     console.log('MYPOST before update')
    // },
    // beforeUnmount(){
    //     console.log('MYPOST before unmount')
    // },
    template: `
    <!--- <div class="myPostsPane"> -->
    <!--- <table> -->
        <tr> 
            <td colspan=3> {{ postData.text }} </td> 
        </tr>
        <tr>
            <td> {{ postData.date_time }} </td>
            <td> ❤️ {{ postData.likes_count }} </td>
            <td> 📝 {{ postData.comments_count }}  </td>
        </tr>
    <!--- </table> -->
    <!--- </div>  -->`
}
