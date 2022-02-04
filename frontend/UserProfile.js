// UserProfile.js
export default {
    props:  {
        initialProfile: Object,
        mode: String, // accepts 'search', 'friendlist', 'friendrequest'
    },
    data(){
        return {
            profile: this.initialProfile,
            actions_mode: this.mode,
        }
    },
    methods: {
        newFriendRequest() {
            this.$store.dispatch('requestNewFriend', {
                friend_id: this.profile.id,
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                } else {
                    this.profile = answer.profile
                }
            })
        },
        acceptFriendRequest(){
            console.log("acceptFriendRequest")
            this.$store.dispatch('acceptFriendRequest', {
                friend_id: this.profile.id,
            })
            .then((answer)=> {
                if (answer.failed) {
                    alert(answer.error_message)
                } else {
                    this.profile = answer.profile
                }
            })
        },
    },
    template: `
    <tr class="user_profile_row_1">
        <td> {{ profile.index }} <br> {{ profile.first_name }} {{ profile.surname }} </td><td> {{ profile.age }} </td> <td> {{ profile.sex }}  </td> <td> {{ profile.city }}  </td>
    </tr>
    <tr class="user_profile_row_2">
        <td colspan=2> {{ profile.interests }}  </td>
        <td>
            <span v-if="profile.friendship === 'itsme'"> It is me </span>
            <span v-if="profile.friendship === 'requested'"> Requested </span>
            <span v-if="profile.friendship === 'accepted'"> Accepted </span>
            <span v-if="profile.friendship === 'declined'"> Declined </span>
        </td>
        <td>
            <button v-if="actions_mode === 'search' && profile.friendship === 'none'" @click="newFriendRequest"> Add To Friends </button>
            <button v-if="actions_mode === 'friendrequest' && profile.friendship === 'requested'" @click="acceptFriendRequest"> Accept </button>
        </td>

    </tr>
    <tr class="user_profile_emptyrow">
        <td colspan=4> </td>
    </tr>
    
    `
}