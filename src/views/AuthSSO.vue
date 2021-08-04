<template>
  <div class="container-fluid" fill-height>
    <v-row justify="space-around">
      <v-col
          v-for="rounded in ['xl']"
          :key="rounded"
          cols="12"
          md="4"
      >
        <v-sheet
          :rounded="rounded"
          class="mx-auto p-5"
          height="100%"
          width="100%"
        >
          <div class="container">    
            <v-row>
              <v-col>
                <v-img class="mx-auto" :src="require('@/assets/logo.png')" max-width="300"></v-img>
              </v-col>
            </v-row>
          </div>
          <v-divider></v-divider>
          <div class="mt-8">
            <span class="custom_title">PPE App</span>
          </div>
          <div class="mt-2">
            <span class="custom_subtitle">PPE App</span>
          </div>
          <div class="my-2 mt-8">
            <v-btn
              color="warning"
              dark
              href="http://localhost:8080"
            >
              Login
            </v-btn>
          </div>
        </v-sheet>  
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { AmplifyEventBus } from "aws-amplify-vue";
import { Auth, Hub } from "aws-amplify";
export default {
  mounted() {
    AmplifyEventBus.$on("authState", eventInfo => {
      if (eventInfo === "signedIn") {
        this.$router.push({ name: "Detections" });
      } else if (eventInfo === "signedOut") {
        this.$router.push({ name: "Auth" });
      }
    });
    
    if (Auth.currentAuthenticatedUser()) {
      this.$router.push({ name: "Detections" });
    } else {
      this.$router.push({ name: "Auth" })
    }
  }
};
</script>

<style scoped>
.custom_title {
  font-size:4em;
  --color:#1E326D;
  font-weight: bold;
  font-family: "Roboto", sans-serif;
}

.custom_subtitle {
  font-size:1em;
  --color:#1E326D;
  font-weight: bold;
  font-family: "Roboto", sans-serif;
}
</style>