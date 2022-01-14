// SearchUsers.js
import UserProfile from "./UserProfile.js"

const SearchUsers = {
    data() {
        return {
            requestFrom: 0,
            requestQuant: 100,
            userProfiles: [],
        }
    },
    created() {
        const lastResults = this.$store.getters.lastSearchProfilesResults;
        this.requestFrom = lastResults.from;
        this.requestQuant = lastResults.quantity;
        this.userProfiles = lastResults.results;
    },
    methods: {
        requestUserProfiles(event) {
            if (event) {
                event.preventDefault()
            }
            this.$store.dispatch('requestUserProfiles', {
                from: this.requestFrom,
                quantity: this.requestQuant
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                } else {
                    this.userProfiles = answer.user_profiles
                }
            })
       }
    },
    components: {
            'user-profile': UserProfile
    },
    template: `
    <div class="loginPane">
    <h1> Search users </h1>
    <form>
        <div>
            <label for="requestFrom"> Request profiles from index: </label>
            <input id="requestFrom" type="number" v-model="requestFrom" required autofocus placeholder="Request from" />
            </div>
        <div>
            <label for="requestQuantity"> Number of profiles to request: </label>
            <input id="requestQuantity" type="number" v-model="requestQuant" required placeholder="Quantity" />
        </div>
        <button type="submit" @click="requestUserProfiles($event)">Search</button>
    </form>
    <table width=100%>
        <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.indx" />
    </table>
    </div>`
}

const SearchUsersShrinked = {
    template: `
    <div class="searchUsersPaneShrinked">
        <h4> <router-link to="/search_users">SEARCH USERS</router-link> </h4>
    </div>`
}

export {SearchUsers, SearchUsersShrinked}