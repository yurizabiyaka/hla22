// FriendList.js
import UserProfile from "./UserProfile.js"

const FriendList = {
    data() {
        return {
            totalFriends: 0,
            requestFrom: 0,
            requestQuant: 1,
            userProfiles: [],
        }
    },
    created() {
        const lastResults = this.$store.getters.lastGetFriendsResults;
        this.totalFriends = lastResults.total;
        this.requestFrom = lastResults.from;
        this.requestQuant = lastResults.quantity;
        this.userProfiles = lastResults.profiles;
    },
    methods: {
        requestFriendList(state) {
            this.$store.dispatch('loadMyFriends', {
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
                        this.$store.commit('setLastGetFriendsResults', {
                            total: answer.friends_total,
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
    <div class="friendListPane">
        <table width=100%><tr>
            <td><h1> Friend List </h1> </td>
            <td><router-link to="/friend_requests" @click="changeMode('/friend_requests');">FRIEND REQUESTS</router-link> </td>
        </tr></table>
            <div>
                <span>Total friends: {{ totalFriends }} </span>
            </div>
            <div>
                <label for="requestFrom"> Friends displayed: </label>
                <input id="requestFrom" type="number" v-model="requestFrom" readonly="readonly" />
            </div>
            <div>
                <label for="requestQuantity"> Page size: </label>
                <input id="requestQuantity" type="number" v-model="requestQuant" required placeholder="Quantity" />
            </div>
        <table width=100%>
            <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" mode="friendlist" />
        </table>
        <infinite-loading  @infinite="requestFriendList"> 
            <template #no-more>no more data</template>
        </infinite-loading>
    </div>`
}

const FriendListShrinked = {
    computed: {
        friendsTotal() {
            return this.$store.getters.lastGetFriendsResults.total
        }
    },
    template: `
    <div class="friendListPaneShrinked">
        <router-link to="/friend_list">FRIEND LIST</router-link>
        <table>
        <tr>
            <td>Friends total:</td>
            <td> {{ friendsTotal }} </td>
        </tr>
    </table>
    </div>`
}

export {FriendList, FriendListShrinked}