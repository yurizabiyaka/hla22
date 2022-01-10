// Register.js
export default {
    // created() {
    //     console.log('REGISTER created')
    // },
    // beforeUpdate(){
    //     console.log('REGISTER before update')
    // },
    // beforeUnmount(){
    //     console.log('REGISTER before unmount')
    // },
    data () {
        return {
          first_name : "",
          surname: "",
          email : "",
          password : "",
          password_confirmation : "",
          age: "",
          sex: "",
          interests: "",
          city: "",
        }
    },
      methods: {
        handleSubmit(e) {
          e.preventDefault()
    
          if (this.password === this.password_confirmation && this.password.length > 0) {
          } else {
            this.password = ""
            this.passwordConfirm = ""
    
            return alert("Passwords do not match")
          }
        }
      },
    template: `
    <div class="registerPane">
        <h1> REGISTER </h1>
        <form>
            <div>
                <input id="first_name" type="text" v-model="first_name" required autofocus placeholder="First Name" />
            </div>
            <div>
                <input id="surname" type="text" v-model="surname" required placeholder="Surname" />
            </div>
            <div>
                <input id="email" type="email" v-model="email" required placeholder="email">
            </div>
            <div>
                <input id="password" type="password" v-model="password" required placeholder="password" />
            </div>
            <div>
                <input id="password-confirm" type="password" v-model="password_confirmation" required placeholder="Confirm Password" />
            </div>
            <div>
                <label for="password-confirm">Sex</label>
                <select v-model="sex">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <div>
                <input id="age" type="text" v-model="age" required placeholder="Age" />
            </div>
            <div>
                <input id="city" type="text" v-model="city" required placeholder="City" />
            </div>
            <div>
                <textarea id="interests" v-model="interests" required placeholder="Interests" />
            </div>

            <div>
                <button type="submit" @click="handleSubmit">
                Register
                </button>
            </div>
        </form>
    </div>`
}