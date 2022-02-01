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

function myfriendsDefaults() {
    return {
        total: 0,
        from: 0,
        quantity: 25,
        profiles: []
    }
}

function lastSearchProfilesResultsDefaults() {
    return {
        from: 0,
        quantity: 25,
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

function lastNewsResultsDefaults() {
    return {
        from: 0,
        quantity: 25,
        results: []
    }
}

const store = Vuex.createStore({
    state() {
        return {
            user: {},
            authenticated: false,
            logged_out: false,
            myposts: [],
            lastSearchProfilesResults: lastSearchProfilesResultsDefaults(),
            myfriends: myfriendsDefaults(),
            myFriendRequests: myfriendRequestsDefaults(),
            paneGroupModes: paneGroupModesDefaults(),
            lastNewsResults: lastNewsResultsDefaults(),
        }
    },
    getters: {
        getUser: (state) => {
            return state.user
        },
        isAuthenticated: (state) => {
            return state.authenticated
        },
        myposts: (state) => {
            return state.myposts
        },
        lastSearchProfilesResults: (state) => {
            return state.lastSearchProfilesResults
        },
        lastGetFriendsResults: (state) => {
            return state.myfriends
        },
        lastGetFriendRequestsResults: (state) => {
            return state.myFriendRequests
        },
        getPaneMode: (state) => (paneGroup) => {
            return state.paneGroupModes[paneGroup]
        },
        lastNewsResults: (state) => {
            return state.lastNewsResults;
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
            state.myposts = allMyPosts
        },
        clearStore(state) {
            state.myposts = [];
            // TODO make init function
            state.lastSearchProfilesResults = lastSearchProfilesResultsDefaults();
            state.myfriends = myfriendsDefaults();
            state.loadMyFriendRequests = myfriendRequestsDefaults();
            state.myFriendRequests = myfriendRequestsDefaults();
            state.paneGroupModes = paneGroupModesDefaults();
            state.lastNewsResults = lastNewsResultsDefaults();
        },
        addNewPost(state, myPost) {
            if (!state.myposts) {
                state.myposts = []
            }
            if (state.myposts.length === 0) {
                state.myposts.push(myPost)
            } else {
                state.myposts.unshift(myPost)
            }
        },
        setLastSearchProfilesResults(state, lastResults) {
            state.lastSearchProfilesResults = lastResults
        },
        updateProfileInLastSearchProfilesResults(state, profile) {
            const idx = state.lastSearchProfilesResults.results.findIndex((currElement) => {
                return currElement.id === profile.id
            })
            if (idx>=0) {
                state.lastSearchProfilesResults.results[idx]=profile
            }
        },
        setLastGetFriendsResults(state, lastResults) {
            state.myfriends = lastResults
        },
        addFriendProfile(state, profile) {
            state.myfriends.total++
            /*
            if (!state.myfriends.results) {
                state.myfriends.results = []
            }
            if (state.myfriends.length === 0) {
                state.myfriends.push(profile)
            } else {
                state.myfriends.unshift(profile)
            }
            */
        },
        setFriendsTotal(state, results){
            state.myfriends.total = results.friends_total
        },
        setLastMyFriendRequests(state, results){
            state.myFriendRequests = results
        },
        setFriendRequestsTotal(state, results){
            state.myFriendRequests.total = results.friend_requests_total
        },
        updateProfileInLastGetFriendRequestsResults(state, profile) {
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
        setLastNewsResults: (state, lastResults) => {
            state.lastNewsResults = lastResults
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
        setNews(state, newNews) {
            state.news = newNews
        }
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
                return makeApiCallNoReauth(config.backendUrl()+"/granted/get_profiles?" + new URLSearchParams({
                    from: rangeInfo.from,
                    quantity: rangeInfo.quantity
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
                    commit('updateProfileInLastSearchProfilesResults', profile)
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
                    commit('updateProfileInLastGetFriendRequestsResults', profile)
                    //commit('addFriendProfile', profile)
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