async function makeApiCallNoReauth(url, fetchOptions, tag, okCallback) {
    const response = await fetch(url, fetchOptions);
    const json = await response.json();
    if (json.failed) {
        console.log(json.error_code, json.error_message);
    } else {
        if (tag === ''){ 
            okCallback(json)
        } else {
            okCallback(json[tag]);
        }
    }
    return json;
}

const store = Vuex.createStore( {
    state() {
        return {
            user: {},
            authenticated: false,
            logged_out: false,
            myposts: [],
            //---------------------
            count: 11,
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
        //-------------------------
        count(state) {
            return state.count
        },
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
            state.myposts = []
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
        //------------------------------
        increment (state, n) {
            state.count += n
        },
        changeILikeForPostID(state, postID) {
            const postIdx = state.news.findIndex(function(element, index, array){
                return element.id===postID
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
            try{
                return makeApiCallNoReauth("http://localhost:8091/v1/new_user", {
                    method: "PUT",
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                }, '', (json) => {
                    commit('setUser', json.user);
                    commit('setAuthenticated', true);
                    commit('clearStore');
                })
            } catch (error) {
                console.log("submitNewUser ", error)
            }
        },
        async signUp({ commit, dispatch }, userInfo) {
            try{
                return makeApiCallNoReauth("http://localhost:8091/v1/login", {
                    method: "POST",
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userInfo)
                }, '', (json) => {
                    commit('setUser', json.user);
                    commit('setAuthenticated', true);
                    dispatch('loadMyPosts')
                })
            } catch (error) {
                console.log("signUp ", error)
            }
        },
        async loginByCreds ({commit, dispatch}) {
            try{
                return makeApiCallNoReauth("http://localhost:8091/v1/granted/login_by_creds", {
                    method: "GET",
                    credentials: 'include',
                }, '', (json) => {
                    commit('setUser', json.user);
                    commit('setAuthenticated', true);
                    dispatch('loadMyPosts')
                })
            } catch (error) {
                console.log("loginByCreds ", error)
            }
        },
        async logout ({commit, dispatch}) {
            try{
                return makeApiCallNoReauth("http://localhost:8091/v1/logout", {
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
        async loadMyPosts ({ commit, dispatch }) {
            try {
                console.log("loadMyPosts called");

                return makeApiCallNoReauth("http://localhost:8091/v1/granted/myposts?"+ new URLSearchParams({
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
        async submitNewPost ({ commit, dispatch }, newPost) {
            try {
                console.log("submitNewPost called");

                return makeApiCallNoReauth("http://localhost:8091/v1/granted/addpost?"+ new URLSearchParams({
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
        //---------------------------
    },
});

export { store }