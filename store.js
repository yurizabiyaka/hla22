const store = Vuex.createStore( {
    state() {
        return {
            authenticated: false,
            myposts: [],
            //---------------------
            count: 11,
            news: []
        }
    },
    getters: {
        isAuthenticated(state) {
            return state.authenticated
        },
        myposts(state) {
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
        setAuthenticated(state, authIsGranted) {
            state.authenticated = authIsGranted
        },
        setMyPosts(state, allMyPosts) {
            state.myposts = allMyPosts
        },
        addNewPost(state, myPost) {
            state.myposts.unshift(myPost)
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
        async login({ commit }) {
            try {
                return fetch("http://localhost:8091/v1/login", {
                    method: 'GET',
                    credentials: 'include'
                })
                .then((response)=>{
                    return response.json();
                }).then((json)=>{
                    if (json.failed) {
                        console.log(json.error_code, json.error_message); 
                    } else {
                        commit('setAuthenticated', json.authenticated)
                        console.log("AUTH STATUS:", json); 
                    }
                    return json
                })
            }
            catch (error) {
                console.log(error);
            }
        },
        async loadMyPosts ({ commit, dispatch }) {
            try {
                var fetchOptions = {
                    method: 'GET',
                    credentials: 'include'
                }

                // load-reauth
                var response = await  fetch("http://localhost:8091/v1/granted/myposts", fetchOptions)
                if (response.status === 403) {
                    const authRes = await dispatch('login')
                    if (authRes.failed) {
                        return response
                    } else { // retry add post
                        response = await fetch("http://localhost:8091/v1/granted/myposts", fetchOptions);
                    }
                }
                if (!response.ok) {
                    return false
                }

                // commit data
                const res = await response.json();
                if ( res.failed ) {
                    console.log(res.error_code, res.error_message); 
                } else {
                    commit('setMyPosts', res.my_posts)
                }
                return res
            }
            catch (error) {
                console.log(error);
            }
        },
        async submitNewPost ({ commit, dispatch }, newPost) {
            try {
                var fetchOptions = {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPost)
                }

                // add-reauth
                var response = await fetch("http://localhost:8091/v1/granted/addpost", fetchOptions);
                if (response.status === 403) {
                    const authRes = await dispatch('login')
                    if (authRes.failed) {
                        return response
                    } else { // retry add post
                        response = await fetch("http://localhost:8091/v1/granted/addpost", fetchOptions);
                    }
                }
                if (!response.ok) {
                    return false
                }

                // commit data
                const res = await response.json();
                if ( res.failed ) {
                    console.log(res.error_code, res.error_message); 
                } else {
                    commit('addNewPost', res.new_post)
                }
                return res
            } catch (error) {
                console.log(error);
            }
        },
        async submitNewUser({ commit, dispatch }, newPost) {
        },
        //---------------------------
        async loadPosts ({ commit }) {
            try {
                fetch("http://localhost:8091/posts")
                .then((response)=>{
                    return response.json();
                }).then((json)=>{
                    commit('setNews', json)
                })
            }
            catch (error) {
                console.log(error);
            }
        }
    },
});

export { store }