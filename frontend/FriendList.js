// FriendList.js
import UserProfile from "./UserProfile.js"

const FriendList = {
    data() {
        return {
            totalFriends: 0,
            requestFrom: 0,
            requestQuant: 1,
            userProfiles: [],
            infiniteId: +new Date(),
        }
    },
    created() {
        const myFriends = this.$store.getters.getFriendsResults;
        this.totalFriends = myFriends.total;
        this.requestFrom = myFriends.from;
        this.requestQuant = myFriends.quantity;
        this.userProfiles = myFriends.profiles;
    },
    methods: {
        clearAndRefresh(){
            this.requestFrom = 0
            this.requestQuant = 1
            this.userProfiles = [];
            this.infiniteId ++
        },
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
                        this.$store.commit('setFriendsResults', {
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
        <div class=navi>
        <table width=100%><tr>
            <td><div><h1> Friend List </h1> </div><div> You read them</div></td>
            <td><router-link to="/friend_requests" @click="changeMode('/friend_requests');">FRIEND REQUESTS</router-link> </td>
        </tr></table>
        </div>
            <div>
                <span>Total friends: {{ totalFriends }} </span>
            </div>
            <div>
                <label for="requestFrom"> Friends displayed: </label>
                <input id="requestFrom" type="number" v-model="requestFrom" readonly="readonly" />
            </div>
            <div>
                <button @click="clearAndRefresh();">Refresh</button>
            </div>
        <div class=infinite infinite-wrapper>
            <table width=100%>
                <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" mode="friendlist" />
            </table>
            <infinite-loading :identifier="infiniteId" @infinite="requestFriendList"> 
                <template #no-more>no more data</template>
            </infinite-loading>
        </div>
    </div>`
}

const FriendListShrinked = {
    computed: {
        friendsTotal() {
            return this.$store.getters.getFriendsResults.total
        }
    },
    template: `
    <div class="friendListPaneShrinked">
        <div class=navi>
            <router-link to="/friend_list">FRIEND LIST</router-link>
        </div>
        <table>
        <tr>
            <td>Friends total:</td>
            <td> {{ friendsTotal }} </td>
        </tr>
    </table>
    </div>`
}

export {FriendList, FriendListShrinked}