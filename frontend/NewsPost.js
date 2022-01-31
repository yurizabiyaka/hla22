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
    <table>
        <tr> 
            <td> {{ post.from }} </td> 
            <td> {{ post.text }} </td> 
        </tr>
        <tr>
            <td> Likes: {{ post.likes }} </td>
            <td> I Like: <button @click="$emit('changeLike', id)"> {{ iLike ? '❤️' : '🤍' }} </button> </td>
        </tr>
    </table>`
}