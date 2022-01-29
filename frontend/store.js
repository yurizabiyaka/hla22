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
        quantity: 100,
        profiles: []
    }
}

function lastSearchProfilesResultsDefaults() {
    return {
        from: 0,
        quantity: 100,
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
            //---------------------
            news: []
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
        //-------------------------
        news(state) {
            return state.news;
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
            if (idx>0) {
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
        //------------------------------
        changeILikeForPostID(state, postID) {
            const postIdx = state.news.findIndex(function (element, index, array) {
                return element.id === postID
            })
            if (postIdx >= 0) {
                state.news[postIdx].iLike = state.news[postIdx].iLike ? false : true
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
                    commit('setLastSearchProfilesResults', {
                        from: rangeInfo.from,
                        quantity: rangeInfo.quantity,
                        results: user_profiles
                    })
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
        async loadMyFriends({ commit, dispatch }, { from = 0, quantity = 100 } = {}) {
            try {
                return makeApiCallNoReauth(config.backendUrl()+"/granted/myfriends?" + new URLSearchParams({
                    from: from,
                    quantity: quantity
                }), {
                    method: 'GET',
                    credentials: 'include',
                }, '', (json) => {
                    commit('setLastGetFriendsResults', {
                        total: json.friends_total,
                        from: from,
                        quantity: quantity,
                        profiles: json.user_profiles
                    })
                    return json
                })
            }
            catch (error) {
                console.log("loadMyFriends ", error);
            }
        },

        //---------------------------
    },
});

export { store }