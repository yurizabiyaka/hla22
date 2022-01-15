// NewsPost.js
export default {
    props: {
        id: Number,
        from: String,
        text: String,
        likes: Number,
        iLike: Boolean,
    },
    emits: ['changeLike'],
    template: `
    <table>
        <tr> 
            <td> {{ from }} </td> 
            <td> {{ text }} </td> 
        </tr>
        <tr>
            <td> Likes: {{ likes }} </td>
            <td> I Like: <button @click="$emit('changeLike', id)"> {{ iLike ? '❤️' : '🤍' }} </button> </td>
        </tr>
    </table>`
}