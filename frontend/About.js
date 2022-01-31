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
    <h1> About </h1>
    <table>
    <tr> <td style="text-align:center"> <b> Домашнее задание №1 </b> </td> </tr>
    <tr> <td style="text-align:center"> OTUS/Highload Architect </td> </tr>
    <tr> <td style="text-align:center">  </td> </tr>
    <tr> <td style="text-align:center"> labOne (c) Юрий Забияка</td> </tr>
    <tr> <td style="text-align:center">  </td> </tr>
    <tr> <td style="text-align:center"> Используемые технологии: </td> </tr>
    <tr> <td > <ul> 
        <li> <a href="https://v3.vuejs.org"> Vue.js v.3 </a> - Реактивный фреймворк для SPA</li>
        <li> <a href="https://vuex.vuejs.org"> Vuex v.4 </a> - Хранилище состояния </li>
        <li> <a href="https://router.vuejs.org/ru/"> Vue router v.4 </a> - SPA навигация </li>
        <li> <a href="https://www.npmjs.com/package/infinite-loading-vue3-ts"> Vue3 infinite loading</a> для постраничного запроса данных </li>
        <li> <a href="https://go.dev"> go ver.1.17 </a> (golang) для бэкэнда </li>
        <li> <a href="https://www.iris-go.com"> iris (v12) </a> - веб фреймворк для go </li> 
        <li> <a href="https://mariadb.com"> mariadb </a> в качестве БД </li> 
        <li> <a href="https://nginx.org/ru/"> nginx </a> в качестве веб-сервера и реверс-прокси </li> 
        <li> <a href="https://www.docker.com"> docker </a> чтобы всё это взлетело </li> 
        </ul>
    </td> </tr>
    </table>
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
    </table>
    </div>`
}

export {About, AboutShrinked}