// About.js
const About = {
    created() {
        console.log('ABOUT created')
    },
    beforeUpdate(){
        console.log('ABOUT before update')
    },
    beforeUnmount(){
        console.log('ABOUT before unmount')
    },
    template: `
    <div class="aboutPane">
    <h1> ABOUT </h1>
    </div>`
}

const AboutShrinked = {
    created() {
        console.log('ABOUT SHRINKED created')
    },
    beforeUpdate(){
        console.log('ABOUT SHRINKED before update')
    },
    beforeUnmount(){
        console.log('ABOUT SHRINKED before unmount')
    },
    template: `
    <div  class="aboutPaneShrinked">
    <router-link to="/about">ABOUT</router-link>
    <table>
    <tr> <td> labOne </td> </tr>
    <tr> <td> (c) </td> </tr>
    <tr> <td> YIZ </td> </tr>
    </table
    </div>`
}

export {About, AboutShrinked}