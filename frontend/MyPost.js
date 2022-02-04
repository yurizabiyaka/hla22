// MyPost.js
export default {
    props: {
        postData: Object,
    },
    // emits: ['changeLike'],
    template: `
    <!--- <div class="myPostsPane"> -->
    <!--- <table> -->
        <tr> 
            <td colspan=3> <span style="white-space: pre;">{{ postData.text }} </span></td> 
        </tr>
        <tr>
            <td> {{ postData.date_time }} </td>
            <td> ❤️ {{ postData.likes_count }} </td>
            <td> 📝 {{ postData.comments_count }}  </td>
        </tr>
    <!--- </table> -->
    <!--- </div>  -->`
}
