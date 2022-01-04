// Deafault.js
const Default = {
    created() {
        console.log('DEFAULT created')
    },
    beforeUpdate(){
        console.log('DEFAULT before update')
    },
    beforeUnmount(){
        console.log('DEFAULT before unmount')
    },
    template: `
    <div class="defaultPane">
    <h1> DEFAULT </h1>
    </div>`
}

const DefaultShrinked = {
    created() {
        console.log('DEFAULT SHRINKED created')
    },
    beforeUpdate(){
        console.log('DEFAULT SHRINKED before update')
    },
    beforeUnmount(){
        console.log('DEFAULT SHRINKED before unmount')
    },
    template: `
    <div class="defaultPaneShrinked">
    <router-link to="/">DEFAULT</router-link>
    </div>`
}

export {Default, DefaultShrinked}