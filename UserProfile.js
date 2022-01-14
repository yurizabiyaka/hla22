// UserProfile.js
export default {
    props:  {
        initialProfile: Object
    },
    data(){
        return {
            profile: this.initialProfile
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
       }
    },
    template: `
    <tr class="user_profile_row_1">
        <td> {{ profile.first_name }} {{ profile.surname }} </td><td> {{ profile.age }} </td> <td> {{ profile.sex }}  </td> <td> {{ profile.city }}  </td>
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
            <button v-if="profile.friendship === 'none'" @click="newFriendRequest"> Add To Friends </button>
        </td>
    </tr>
    <tr class="user_profile_emptyrow">
        <td colspan=4> </td>
    </tr>
    
    `
}