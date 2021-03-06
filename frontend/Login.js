// Login.js
import Register from "./Register.js"
import SignIn from "./SignIn.js"

const Login = {
    created() {
        console.log('LOGIN created')
    },
    beforeUpdate(){
        console.log('LOGIN before update')
    },
    beforeUnmount(){
        console.log('LOGIN before unmount')
    },
    methods: {
        logMeOut(event) {
            if (event) {
                event.preventDefault()
            }
            this.$store.commit('setAuthenticated', false);
            this.$store.dispatch('logout')
            .then(()=> {
                this.$router.push({ path: 'logout'})
            })
            
       }
    },
    components: {
            'register': Register,
            'sign-in': SignIn
    },
    template: `
    <div class="loginPane">
    <div class=navi>        
        <table width=100%>
            <tr><td><h1> Login </h1></td></tr>
            <tr><td> <a href='' @click="logMeOut($event)">LOGOUT</a></td></tr>
        </table>
    </div>
    <table width=100%>
        <tr><td colspan=3>{{ this.$store.getters.isAuthenticated ? "Welcome "+ this.$store.getters.getUser.email  : "Login required"}} </td> </tr>
        <tr>
            <td align=left valign=top width=40%> <sign-in /> </td>
            <td align=center valign=top> <h1> OR </h1> </td>
            <td align=right valign=top  width=40%> <register /> </td>
        </tr>
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
    methods: {
        logMeOut(event) {
            if (event) {
                event.preventDefault()
            }
            this.$store.commit('setAuthenticated', false);
            this.$store.dispatch('logout')
            .then(()=> {
                this.$router.push({ path: 'logout'})
            })
        }
    },
    template: `
    <div class="loginPaneShrinked">
        <div class=navi>
        <table>
            <tr><td> <router-link to="/">LOGIN</router-link> </td></tr>
            <tr><td> <a href='' @click="logMeOut($event)">LOGOUT</a></td></tr>
        </table>
        </div>
        {{ this.$store.getters.isAuthenticated ? "Welcome "+ this.$store.getters.getUser.email  :"Login required"}}
    </div>`
}

export {Login, LoginShrinked}