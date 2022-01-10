// Login.js
import Register from "./Register.js"

const Login = {
    created() {
        console.log('LOGIN created')
        // если есть токен и имя пользователя - то релогиниться с ним:
        this.$store.dispatch('login')
        .then(() => {
            if (this.$route.query && this.$route.query.redirect)
                this.$router.push(this.$route.query.redirect)
        })
        console.log(this.$route.query)
    },
    beforeUpdate(){
        console.log('LOGIN before update')
    },
    beforeUnmount(){
        console.log('LOGIN before unmount')
    },
    components: {
            'register': Register
    },
    template: `
    <div class="loginPane">
    <h1> Login </h1>
    <table>
        <tr><td> LOGOUT </td></tr>
        <tr><td>{{ this.$store.getters.isAuthenticated ? "Authenticated" : "Login required"}} </td> </tr>
        <tr><td> <register /> </td></tr>
    </table>
    </div>`
}

const LoginShrinked = {
    created() {
        console.log('LOGIN SHRINKED created')
    },
    beforeUpdate(){
        console.log('LOGIN SHRINKED before update')
    },
    beforeUnmount(){
        console.log('LOGIN SHRINKED before unmount')
    },
    template: `
    <div class="loginPaneShrinked">
        <table>
            <tr><td> <router-link to="/">LOGIN</router-link> </td></tr>
            <tr><td> LOGOUT </td></tr>
            <tr><td>{{ this.$store.getters.isAuthenticated ? "Authenticated" : "Login required"}} </td> </tr>
        </table>
    </div>`
}

export {Login, LoginShrinked}