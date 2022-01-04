const store = Vuex.createStore( {
    state() {
        return {
            count: 11,
            news: [
                { id: 1, from: 'Author The King', text: 'My journey with Vue', likes: 10, iLike: true, },
                { id: 2, from: 'Bilbo', text: 'Blogging with Vue', likes: 12, iLike: true,  },
                { id: 3, from: 'Eleonor', text: 'Why Vue is so fun', likes: 6, iLike: false,  },
            ]
        }
    },
    getters: {
        count(state) {
            return state.count
        },
        news(state) {
            return state.news;
        },
    },
    mutations: {
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
    }
});

export { store }