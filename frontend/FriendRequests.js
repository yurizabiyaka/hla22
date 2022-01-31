// FriendRequests.js
import UserProfile from "./UserProfile.js"

const FriendRequests = {
    data() {
        return {
            totalRequests: 0,
            requestFrom: 0,
            requestQuant: 1,
            userProfiles: [],
        }
    },
    created() {
        const lastResults = this.$store.getters.lastGetFriendRequestsResults;
        this.totalRequests = lastResults.total;
        this.requestFrom = lastResults.from;
        this.requestQuant = lastResults.quantity;
        this.userProfiles = lastResults.profiles;
    },
    methods: {
        requestFriendRequestsList(state) {
            this.$store.dispatch('loadMyFriendRequests', {
                from: this.requestFrom,
                quantity: this.requestQuant
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                } else {
                    if (answer.user_profiles && answer.user_profiles.length){
                        this.requestFrom += answer.user_profiles.length;
                        this.userProfiles.push(...answer.user_profiles);
                        this.$store.commit('setLastMyFriendRequests', {
                            total: answer.friend_requests_total,
                            from: this.requestFrom,
                            quantity: this.requestQuant,
                            profiles: this.userProfiles
                        })
                        state.loaded();
                    } else {
                        state.complete();
                    }
                }
            })
        },
        changeMode(mode){
            this.$store.commit('setPaneMode', {group: 'friends', mode: mode})
        },
    },
    components: {
        'user-profile': UserProfile,
        'infinite-loading': InfiniteLoadingVue3Ts,
    },
    template: `
    <div class="friendRequestsPane">
        <table width=100%><tr>
            <td><router-link to="/friend_list" @click="changeMode('/friend_list');">FRIEND LIST</router-link> </td>
            <td><h1> Friend Requests </h1> </td>
        </tr></table>
            <div>
                <span>Total friend requests: {{ totalRequests }} </span>
            </div>
            <div>
                <label for="requestFrom"> Requests displayed: </label>
                <input id="requestFrom" type="number" v-model="requestFrom" readonly="readonly" />
            </div>
            <div>
                <label for="requestQuantity"> Page size: </label>
                <input id="requestQuantity" type="number" v-model="requestQuant" required placeholder="Quantity" />
            </div>
        <table width=100%>
            <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" mode="friendrequest" />
        </table>
        <infinite-loading  @infinite="requestFriendRequestsList"> 
            <template #no-more>no more data</template>
        </infinite-loading>
    </div>`
}

const FriendRequestsShrinked = {
    computed: {
        friendReqsTotal() {
            return this.$store.getters.lastGetFriendRequestsResults.total
        }
    },
    template: `
    <div class="friendRequestsPaneShrinked">
        <router-link to="/friend_requests">FRIEND REQUESTS</router-link>
        <table>
        <tr>
            <td>Requests total:</td>
            <td> {{ friendReqsTotal }} </td>
        </tr>
    </table>
    </div>`
}

export {FriendRequests, FriendRequestsShrinked}