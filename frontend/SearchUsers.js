// SearchUsers.js
import UserProfile from "./UserProfile.js"

const SearchUsers = {
    data() {
        return {
            requestFrom: 0,
            requestQuant: 1,
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
       infiniteHandler(state) {
        console.log("infiniteHandler")
            this.$store.dispatch('requestUserProfiles', {
                from: this.requestFrom,
                quantity: this.requestQuant
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                    state.error();
                } else {
                    if (answer.user_profiles && answer.user_profiles.length) {
                        this.requestFrom += answer.user_profiles.length;
                        this.userProfiles.push(...answer.user_profiles);
                        this.$store.commit('setLastSearchProfilesResults', {
                            from: this.requestFrom,
                            quantity: this.requestQuant,
                            results: this.userProfiles
                        })
                        state.loaded();
                    } else {
                        state.complete();
                    }
                }
            })
        },
    },
    components: {
            'user-profile': UserProfile,
            'infinite-loading': InfiniteLoadingVue3Ts,
    },
    template: `
    <div class="searchUsersPane">
    <h1> Search users </h1>
        <div>
            <label for="requestFrom"> Displayed profiles: </label>
            <input id="requestFrom" type="number" v-model="requestFrom" readonly="readonly" />
        </div>
        <div>
            <label for="requestQuantity"> Page size: </label>
            <input id="requestQuantity" type="number" v-model="requestQuant" required placeholder="Quantity" />
        </div>

        <table width=100%>
            <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" mode="search" />
        </table>
        <infinite-loading  @infinite="infiniteHandler"> 
            <template #no-more>no more data</template>
        </infinite-loading>

    </div>`
}

const SearchUsersShrinked = {
    template: `
    <div class="searchUsersPaneShrinked">
        <router-link to="/search_users">SEARCH USERS</router-link>
    </div>`
}

export {SearchUsers, SearchUsersShrinked}