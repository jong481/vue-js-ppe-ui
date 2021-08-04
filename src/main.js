import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import Vue from "vue";
import App from "./App.vue";
import router from "./router";

// Import Amplify Modules, Plugins, and aws exports file
import Amplify, * as AmplifyModules from "aws-amplify";
import { AmplifyPlugin } from "aws-amplify-vue";
import awsconfig from "./aws-exports";
import "@aws-amplify/ui-vue";

// Import other components
import JsonCSV from 'vue-json-csv'

// Import Bootstrap Vue
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Import Vue Components
import Vuetify from 'vuetify';
import vSelect from 'vue-select';
import 'vuetify/dist/vuetify.min.css';
import 'vue-select/dist/vue-select.css';

// Configure Amplify in project
const appconfig = {
  "aws_project_region": "",
  "aws_appsync_graphqlEndpoint": "",
  "aws_appsync_region": "",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "",
  "aws_user_files_s3_bucket": "",
  "aws_user_files_s3_bucket_region": "",
  "aws_cognito_region": "",
  "aws_user_pools_id": "",
  "aws_user_pools_web_client_id": "",
  "aws_cognito_identity_pool_id": "",
  "oauth": {
    "domain": "",
    "scope":[
      "email",
      "openid",
      "aws.cognito.signin.user.admin"
    ],
    "redirectSignIn":"detections",
    "redirectSignOut":"login",
    "responseType":"token",
    "client_id":""
  }
};
Amplify.configure(appconfig);

// Configure vue to use plugins and modules
Vue.use(AmplifyPlugin, AmplifyModules);

// Configure Boostrap Vue
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

// Configure Vue Components
Vue.use(Vuetify);
Vue.component('v-select', vSelect)
Vue.component('downloadCsv', JsonCSV)

/*
Instantiate Vue Filters
*/
// Trims numerical confidence score for display purposes
Vue.filter('confidence_limit', function (value, size) {
  if (!value) return '';
  value = value.toString();

  return value.substr(0, 4);
});

// Cleans username for display purposes
Vue.filter('clean_username', function (value, size) {
  if (!value) return '';
  value = value.toString();

  return value.replace('AzureAD_', '').replace('.onmicrosoft.com', '');
});

Vue.config.productionTip = false;

/*
Instantiate Vue
*/
new Vue({
  icons: {
    iconfont: 'mdi',
  },
  vuetify : new Vuetify(),
  router,
  render: h => h(App)
}).$mount("#app");