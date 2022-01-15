// FriendList.js
import UserProfile from "./UserProfile.js"

const FriendList = {
    data() {
        return {
            totalFriends: 0,
            requestFrom: 0,
            requestQuant: 100,
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
        requestFriendList(event) {
            if (event) {
                event.preventDefault()
            }
            this.$store.dispatch('loadMyFriends', {
                from: this.requestFrom,
                quantity: this.requestQuant
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                } else {
                    this.totalFriends = answer.friends_total;
                    this.userProfiles = answer.user_profiles
                }
            })
       }
    },
    components: {
        'user-profile': UserProfile
    },
    template: `
    <div class="friendListPane">
        <h1> Friend List </h1>
        <form>
            <div>
                <span>Total friends: {{ totalFriends }} </span>
            </div>
            <div>
                <label for="requestFrom"> Display friends from index: </label>
                <input id="requestFrom" type="number" v-model="requestFrom" required autofocus placeholder="Request from" />
            </div>
            <div>
                <label for="requestQuantity"> Number of profiles to request: </label>
                <input id="requestQuantity" type="number" v-model="requestQuant" required placeholder="Quantity" />
            </div>
            <button type="submit" @click="requestFriendList($event)">Search</button>
        </form>
        <table width=100%>
            <user-profile v-for="profile in userProfiles" :initialProfile="profile" :key="profile.index" />
        </table>
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