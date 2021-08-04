<template>
  <v-app>
    <div id="app">
      <div class="heading">
      </div>
      <div v-if="!$route.meta.plainLayout">
        <v-app-bar app color="white" flat>
          <v-tabs centered class="ml-n9" color="grey darken-1">
          </v-tabs>
        </v-app-bar>
        <router-view />
      </div>
      <div v-if="$route.meta.plainLayout">
        <router-view/>
      </div>
    </div>
  </v-app>
</template>

<script>
  //import Amplify
  import { Auth, API, graphqlOperation } from "aws-amplify";
  import { components } from "aws-amplify-vue";
  import { AmplifyEventBus } from 'aws-amplify-vue'

  //import amplify graphql operations
  import * as queries from "@/graphql/queries";
  import * as mutations from "@/graphql/mutations";
  import * as subscriptions from "@/graphql/subscriptions";

  export default {
    data() {
      return {
        links: [
          'Detections'
        ],
        signedIn: false
      }
    },
    async beforeCreate() {
      try {
        const user = await Auth.currentAuthenticatedUser()
        this.signedIn = true
      } catch (err) {
        this.signedIn = false
      }
      AmplifyEventBus.$on('authState', info => {
        if (info === 'signedIn') {
          this.signedIn = true
        } else {
          this.signedIn = false
        }
      });
    },
    methods: {
      signOut: async function () {
        await Auth.signOut()
        this.signedIn = false

        this.$router.go('/login');
      }
    }
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    background-color: #f1f1f1
  }

  .heading {
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
  }

  .d-center {
    display: flex;
    align-items: center;
  }

  :root {
    /* Colors */
    --amazonOrange: #999999; 
    --lightAmazonOrange: #cccccc;
    --darkAmazonOrange: #cccccc;
    --darkBlue: #999999;
    --light-blue: #999999;

    --squidInk: #232F3E;
    --lightSquidInk: #31465F;
    --deepSquidInk: #152939;
    --grey: #828282;
    --lightGrey: #C4C4C4;
    --silver: #E1E4EA;
    --red: #DD3F5B;
    --white: #FFFFFF;
  }
</style>
