// SignIn.js
export default {
    data () {
        return {
          email : "",
          password : ""
        }
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault()
            if (this.password.length > 0) {
                this.$store.dispatch('signUp', {
                    email: this.email,
                    password: this.password
                }).then((result) => result && result.failed && alert('Sorry, wrong email or password'))
                .then(() => {
                    if (this.$route.query && this.$route.query.redirect) {
                        this.$router.push(this.$route.query.redirect)
                    }
                })
            }
        }
    },
    template: `
    <div class="signin">
    <div class=navi>
      <div><h4>SIGN-IN</h4></div>
      <div>if you have a password</div>
    </div>
    <form>
      <div>
        <input id="email" type="email" v-model="email" required autofocus placeholder="Email"/>
      </div>
      <div>
        <div>
          <input id="password" type="password" v-model="password" required placeholder="Password"/>
        </div>
      </div>
      <div>
        <button type="submit" @click="handleSubmit">
          Login
        </button>
      </div>
    </form>
  </div>
    `
}