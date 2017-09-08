import Vue from 'vue'
import App from './App.vue'

Vue.directive('focus', {
	//v-focus自动聚焦自定义指令
	inserted: function(el) {
		el.focus();
	},
});
new Vue({
	el: '#app',
	render: h => h(App)
})