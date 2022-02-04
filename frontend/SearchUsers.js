// SearchUsers.js
import UserProfile from "./UserProfile.js"
import debounce from "./lib/debounce-1.2.1.js"

const SearchUsers = {
    data() {
        return {
            requestFrom: 0,
            requestQuant: 1,
            filter: "",
            userProfiles: [],
            infiniteId: +new Date(),
            firstLoad: true,
            defaultQuantity: 1,
        }
    },
    watch: {
        filter() {
            if (this.firstLoad) {
                this.firstLoad = false;
                return;
            }
            this.clearAndRefresh()
        },
    },
    created() {
        this.clearAndRefresh = debounce(this.clearAndRefresh, 500);
        const searchResults = this.$store.getters.searchProfilesResults;
        this.requestFrom = searchResults.from;
        this.requestQuant = searchResults.quantity;
        this.defaultQuantity = searchResults.quantity;
        this.filter = searchResults.filter;
        this.userProfiles = searchResults.results;
    },
    unmounted() {
        this.clearAndRefresh.clear()
    },
    methods: {
        clearAndRefresh(){
            this.requestFrom = 0;
            this.requestQuant = this.defaultQuantity;
            this.userProfiles = [];
            this.infiniteId ++
        },
        infiniteHandler(state) {
            this.$store.dispatch('requestUserProfiles', {
                from: this.requestFrom,
                quantity: this.requestQuant,
                filter: this.filter,
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                    state.error();
                } else {
                    if (answer.user_profiles && answer.user_profiles.length) {
                        this.requestFrom += answer.user_profiles.length;
                        this.userProfiles.push(...answer.user_profiles);
                        this.$store.commit('setSearchProfilesResults', {
                            from: this.requestFrom,
                            quantity: this.requestQuant,
                            filter: this.filter,
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
        <div class=navi>        
            <h1> Search users </h1>
        </div>
        <div>
            <label for="requestFrom"> Displayed profiles: </label>
            <input id="requestFrom" type="number" v-model="requestFrom" readonly="readonly" />
        </div>
        <div>
            <label for="requestFilter"> Filter: </label>
            <input id="requestFilter" type="text" v-model="filter" placeholder="First name and Surname first-letters filter" />
        </div>
        <div class=infinite infinite-wrapper>
            <table width=100%>
                <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" mode="search" />
            </table>
            <infinite-loading :identifier="infiniteId"  @infinite="infiniteHandler" > 
                <template #no-more>no more data</template>
            </infinite-loading>
        </div>

    </div>`
}

const SearchUsersShrinked = {
    template: `
    <div class="searchUsersPaneShrinked">
        <router-link to="/search_users">SEARCH USERS</router-link>
    </div>`
}

export {SearchUsers, SearchUsersShrinked}