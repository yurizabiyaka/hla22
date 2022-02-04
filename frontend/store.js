import config from "./config.js"

async function makeApiCallNoReauth(url, fetchOptions, tag, okCallback) {
    const response = await fetch(url, fetchOptions);
    const json = await response.json();
    if (json.failed) {
        console.log(json.error_code, json.error_message);
    } else {
        if (tag === '') {
            okCallback(json)
        } else {
            okCallback(json[tag]);
        }
    }
    return json;
}

function myFriendsDefaults() {
    return {
        total: 0,
        from: 0,
        quantity: 25,
        profiles: []
    }
}

function searchProfilesResultsDefaults() {
    return {
        from: 0,
        quantity: 25,
        filter: "",
        results: []
    }
}

function myfriendRequestsDefaults() {
    return {
        total: 0,
        from: 0,
        quantity: 25,
        profiles: []
    }
}

function paneGroupModesDefaults() {
    return {
        posts: "/myposts",
        friends: "/friend_list"
    }
}

function newsResultsDefaults() {
    return {
        from: 0,
        quantity: 25,
        results: []
    }
}

function profilesStoreDefaults() {
    return {
        profiles: new Map,
        getProfiles: function (requestedProfiles) {
            var profilesResult = [];
            requestedProfiles && requestedProfiles.forEach && requestedProfiles.forEach((currentValue) => {
                if (currentValue.id && this.profiles.has(currentValue.id)) {
                    profilesResult.push(this.profiles.get(currentValue.id))
                } else {
                    console.log("profilesStore is missing", currentValue && currentValue.id)
                }
            }, this)
            return profilesResult;
        },
        updateProfile: function (requestedProfile) {
            if (requestedProfile && requestedProfile.id) {
                this.profiles.set(requestedProfile.id, requestedProfile)
            }
        },
        updateProfiles: function (requestedProfiles) {
            requestedProfiles && requestedProfiles.forEach && requestedProfiles.forEach((currentValue) => {
                this.profiles.set(currentValue.id, currentValue)
            }, this)
        },
        clear: function() {
            this.profiles.clear();
        }
    }
}

const store = Vuex.createStore({
    state() {
        return {
            user: {},
            authenticated: false,
            logged_out: false,
            myPosts: [],
            profilesStore: profilesStoreDefaults(),
            searchProfilesResults: searchProfilesResultsDefaults(),
            myFriends: myFriendsDefaults(), // todo if something changes here, update searchProfilesResults
            myFriendRequests: myfriendRequestsDefaults(),
            paneGroupModes: paneGroupModesDefaults(),
            newsResults: newsResultsDefaults(),
        }
    },
    getters: {
        getUser: (state) => {
            return state.user
        },
        isAuthenticated: (state) => {
            return state.authenticated
        },
        myPosts: (state) => {
            return state.myPosts
        },
        searchProfilesResults: (state) => {
            var updatedProfiles = state.profilesStore.getProfiles(state.searchProfilesResults.results)
            state.searchProfilesResults.results = updatedProfiles
            return state.searchProfilesResults
        },
        getFriendsResults: (state) => {
            var updatedProfiles = state.profilesStore.getProfiles(state.myFriends.profiles)
            state.myFriends.profiles = updatedProfiles
            return state.myFriends
        },
        getFriendRequestsResults: (state) => {
            return state.myFriendRequests
        },
        getPaneMode: (state) => (paneGroup) => {
            return state.paneGroupModes[paneGroup]
        },
        newsResults: (state) => {
            return state.newsResults;
        },
    },
    mutations: {
        setUser(state, user) {
            state.isAuthenticated = true
            state.user = user
        },
        setAuthenticated(state, authIsGranted) {
            state.authenticated = authIsGranted
        },
        setMyPosts(state, allMyPosts) {
            state.myPosts = allMyPosts
        },
        clearStore(state) {
            state.myPosts = [];
            // TODO make init function
            state.searchProfilesResults = searchProfilesResultsDefaults();
            state.myFriends = myFriendsDefaults();
            state.loadMyFriendRequests = myfriendRequestsDefaults();
            state.myFriendRequests = myfriendRequestsDefaults();
            state.paneGroupModes = paneGroupModesDefaults();
            state.newsResults = newsResultsDefaults();
            state.profilesStore.clear();
        },
        addNewPost(state, myPost) {
            if (!state.myPosts) {
                state.myPosts = []
            }
            if (state.myPosts.length === 0) {
                state.myPosts.push(myPost)
            } else {
                state.myPosts.unshift(myPost)
            }
        },
        setSearchProfilesResults(state, searchResults) {
            state.searchProfilesResults = searchResults;
            state.profilesStore.updateProfiles(searchResults.results)
        },
        updateProfileInSearchProfilesResults(state, profile) {
            state.profilesStore.updateProfile(profile)
        },
        setFriendsResults(state, friendsResults) {
            state.myFriends = friendsResults
            state.profilesStore.updateProfiles(friendsResults.profiles)
        },
        addFriendProfile(state, profile) {
            state.myFriends.total++
        },
        setFriendsTotal(state, results){
            state.myFriends.total = results.friends_total
        },
        setFriendRequests(state, results){
            state.myFriendRequests = results
        },
        setFriendRequestsTotal(state, results){
            state.myFriendRequests.total = results.friend_requests_total
        },
        updateProfileInFriendRequestsResults(state, profile) {
            const idx = state.myFriendRequests.profiles.findIndex((currElement) => {
                return currElement.id === profile.id
            })
            if (idx>=0) {
                state.myFriendRequests.profiles[idx]=profile
            } else {
                console.log("cannot find", profile, state.myFriendRequests.profiles)
            }
        },
        setPaneMode: (state, pane) => {
            state.paneGroupModes[pane.group] = pane.mode
        },
        setNewsResults: (state, newsResults) => {
            state.newsResults = newsResults
        },
        //------------------------------
        changeILikeForPostID(state, postID) {
            const postIdx = state.news.findIndex(function (element, index, array) {
                return element.id === postID
            })
            if (postIdx >= 0) {
                state.news[postIdx].i_like = state.news[postIdx].i_like ? false : true
            }
        },
    },
    actions: {
        async submitNewUser({ commit, dispatch }, newUser) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/new_user", {
                    method: "PUT",
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                }, '', (json) => {
                    commit('clearStore');
                    commit('setUser', json.user);
                    commit('setAuthenticated', true);
                })
            } catch (error) {
                console.log("submitNewUser ", error)
            }
        },
        async signUp({ commit, dispatch }, userInfo) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/login", {
                    method: "POST",
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userInfo)
                }, '', (json) => {
                    commit('clearStore');
                    commit('setUser', json.user);
                    commit('setAuthenticated', true);
                    dispatch('loadMyPosts');
                    dispatch('loadMyFriends');
                    dispatch('loadMyFriendRequests');
                })
            } catch (error) {
                console.log("signUp ", error)
            }
        },
        async loginByCreds({ commit, dispatch }) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/granted/login_by_creds", {
                    method: "GET",
                    credentials: 'include',
                }, '', (json) => {
                    commit('setUser', json.user);
                    commit('setAuthenticated', true);
                    dispatch('loadMyPosts');
                    dispatch('loadMyFriends');
                    dispatch('loadMyFriendRequests');
                })
            } catch (error) {
                console.log("loginByCreds ", error)
            }
        },
        async logout({ commit, dispatch }) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/logout", {
                    method: "GET",
                    credentials: 'include',
                }, '', (json) => {
                    commit('setUser', {});
                    commit('setAuthenticated', false);
                    commit('clearStore');
                })
            } catch (error) {
                console.log("logout ", error)
            }
        },
        async loadMyPosts({ commit, dispatch }) {
            try {
                console.log("loadMyPosts called");

                return makeApiCallNoReauth(config.backendUrl()+"/granted/myposts?" + new URLSearchParams({
                }), {
                    method: 'GET',
                    credentials: 'include'
                }, '', (json) => {
                    console.log("loadMyPosts json: ", json);
                    commit('setMyPosts', json.my_posts)
                })
            }
            catch (error) {
                console.log("loadMyPosts", error);
            }
        },
        async submitNewPost({ commit, dispatch }, newPost) {
            try {
                console.log("submitNewPost called");

                return makeApiCallNoReauth(config.backendUrl()+"/granted/addpost?" + new URLSearchParams({
                }), {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPost)
                }, 'new_post', (new_post) => {
                    commit('addNewPost', new_post)
                })
            }
            catch (error) {
                console.log("submitNewPost ", error);
            }
        },
        async requestUserProfiles({ commit, dispatch }, rangeInfo) {
            try {
                var name, surname;
                [name, surname] = rangeInfo.filter.split(/\s+/); // js array destructuring
                if (typeof name === 'undefined') name="";
                if (typeof surname === 'undefined') surname="";
                return makeApiCallNoReauth(config.backendUrl()+"/granted/get_profiles?" + new URLSearchParams({
                    from: rangeInfo.from,
                    quantity: rangeInfo.quantity,
                    name: name,
                    surname: surname,
                }), {
                    method: 'GET',
                    credentials: 'include',
                }, 'user_profiles', (user_profiles) => {
                    return user_profiles
                })
            }
            catch (error) {
                console.log("requestUserProfiles ", error);
            }
        },
        async requestNewFriend({ commit, dispatch }, friend_id) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/granted/new_friend_request?" + new URLSearchParams(
                    friend_id
                ), {
                    method: 'PUT',
                    credentials: 'include',
                }, 'profile', (profile) => {
                    commit('updateProfileInSearchProfilesResults', profile)
                    commit('addFriendProfile', profile)
                    return profile
                })
            }
            catch (error) {
                console.log("requestNewFriend ", error);
            }
        },
        async loadMyFriends({ commit, dispatch }, { from = 0, quantity = 1 } = {}) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/granted/myfriends?" + new URLSearchParams({
                    from: from,
                    quantity: quantity
                }), {
                    method: 'GET',
                    credentials: 'include',
                }, '', (json) => {
                    json.user_profiles && commit('setFriendsTotal', json)
                    return json
                })
            }
            catch (error) {
                console.log("loadMyFriends ", error);
            }
        },
        async loadMyFriendRequests({ commit, dispatch }, { from = 0, quantity = 1 } = {}) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/granted/myfriendrequests?" + new URLSearchParams({
                    from: from,
                    quantity: quantity
                }), {
                    method: 'GET',
                    credentials: 'include',
                }, '', (json) => {
                    json.user_profiles && commit('setFriendRequestsTotal', json)
                    return json
                })
            }
            catch (error) {
                console.log("loadMyFriendRequests ", error);
            }
        },
        async acceptFriendRequest({ commit, dispatch }, friend_id) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/granted/accept_friend_request?" + new URLSearchParams(
                    friend_id
                ), {
                    method: 'GET',
                    credentials: 'include',
                }, 'profile', (profile) => {
                    commit('updateProfileInFriendRequestsResults', profile)
                    return profile
                })
            }
            catch (error) {
                console.log("acceptFriendRequest ", error);
            }
        },
        async loadNews({ commit, dispatch }, { from = 0, quantity = 1 } = {}) {
            try {
                console.log("loadNews called");

                return makeApiCallNoReauth(config.backendUrl()+"/granted/mynews?" + new URLSearchParams({
                    from: from,
                    quantity: quantity
                }), {
                    method: 'GET',
                    credentials: 'include'
                }, '', (json) => {
                    //console.log("loadNews json: ", json);
                    return json
                })
            }
            catch (error) {
                console.log("loadNews", error);
            }
        },
        //---------------------------
    },
});

export { store }