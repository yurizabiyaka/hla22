// NewsPost.js
export default {
    props:  {
        initialPost: Object,
        mode: String, // accepts 'my', 'mews'
    },
    data(){
        return {
            post: this.initialPost,
            actions_mode: this.mode,
        }
    },
    emits: ['changeLike'],
    template: `
        <tr> 
            <td> {{ post.friend_name }} {{ post.friend_surname }} </td> 
            <td> {{ post.date_time }} </td>
            <td>  </td>
        </tr>
        <tr> 
            <td colspan=3> {{ post.text }} </td> 
        </tr>
        <tr>
            <td> Likes: {{ post.likes_count }} </td>
            <td> I Like: <button @click="$emit('changeLike', id)"> {{ post.i_like ? '❤️' : '🤍' }} </button> </td>
            <td> Comments: {{ post.comments_count }} </td>
        </tr>
    `
}