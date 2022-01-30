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
       },
       infiniteHandler({ loaded }) {
        console.log("infiniteHandler")
            this.$store.dispatch('requestUserProfiles', {
                from: this.requestFrom,
                quantity: this.requestQuant
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                } else {
                    if (answer.user_profiles && answer.user_profiles.length) {
                        console.log("got profiles:", answer.user_profiles.length)
                        this.requestFrom += this.requestQuant;
                        this.userProfiles.push(...answer.user_profiles);
                        loaded(this.requestQuant, this.requestQuant);
                    } else {
                        console.log("no profiles")
                        this.noResult = true;
                        this.message = "No result found";
                        loaded(this.requestQuant, this.requestQuant);
                    }
                }
            })
        },
    },
    components: {
            'user-profile': UserProfile,
    },
    template: `
    <div class="searchUsersPane">
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
        <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" />
    </table>
    <span>---------------</span>

    <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" />
    <VueEternalLoading :load="infiniteHandler"></VueEternalLoading>

    </div>`
}

const SearchUsersShrinked = {
    template: `
    <div class="searchUsersPaneShrinked">
        <router-link to="/search_users">SEARCH USERS</router-link>
    </div>`
}

export {SearchUsers, SearchUsersShrinked}