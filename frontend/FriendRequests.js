// FriendRequests.js
import UserProfile from "./UserProfile.js"

const FriendRequests = {
    data() {
        return {
            totalRequests: 0,
            requestFrom: 0,
            requestQuant: 1,
            userProfiles: [],
            infiniteId: +new Date(),
        }
    },
    created() {
        const friendRequests = this.$store.getters.getFriendRequestsResults;
        this.totalRequests = friendRequests.total;
        this.requestFrom = friendRequests.from;
        this.requestQuant = friendRequests.quantity;
        this.userProfiles = friendRequests.profiles;
    },
    methods: {
        clearAndRefresh(){
            this.requestFrom = 0
            this.requestQuant = 1
            this.userProfiles = [];
            this.infiniteId ++
        },
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
                        this.$store.commit('setFriendRequests', {
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
        <div class=navi>
        <table width=100%><tr>
            <td><router-link to="/friend_list" @click="changeMode('/friend_list');">FRIEND LIST</router-link> </td>
            <td><div><h1> Friend Requests </h1></div><div> They read you</div></td>
        </tr></table>
        </div>
        <div>
            <span>Total friend requests: {{ totalRequests }} </span>
        </div>
        <div>
            <label for="requestFrom"> Requests displayed: </label>
            <input id="requestFrom" type="number" v-model="requestFrom" readonly="readonly" />
        </div>
        <div>
            <button @click="clearAndRefresh();">Refresh</button>
        </div>
        <div class=infinite infinite-wrapper>
            <table width=100%>
                <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" mode="friendrequest" />
            </table>
            <infinite-loading :identifier="infiniteId" @infinite="requestFriendRequestsList"> 
                <template #no-more>no more data</template>
            </infinite-loading>
        </div>
    </div>`
}

const FriendRequestsShrinked = {
    computed: {
        friendReqsTotal() {
            return this.$store.getters.getFriendRequestsResults.total
        }
    },
    template: `
    <div class="friendRequestsPaneShrinked">
        <div class=navi>
            <router-link to="/friend_requests">FRIEND REQUESTS</router-link>
        </div>
        <table>
        <tr>
            <td>Requests total:</td>
            <td> {{ friendReqsTotal }} </td>
        </tr>
    </table>
    </div>`
}

export {FriendRequests, FriendRequestsShrinked}