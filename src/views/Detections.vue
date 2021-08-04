<template>
  <div>
    <v-navigation-drawer :width="325" v-model="drawer" app>
      <v-sheet color="white" class="pa-4">
        <!-- Dashboard Logo -->
        <v-img
          contain    
          max-height="200"
          :src="require('@/assets/iconlogo.jpg')"
        ></v-img>
      </v-sheet>
      <v-divider></v-divider>
      <v-sheet>
        <div class="m-3">
          <!-- Model Dropdown -->
          <div class="mb-2 font-weight-bold">Select Model:</div>
            <v-select
              name="ppe_select"
              v-model="selectedModel"
              label="ppe_name"
              :filterable="false"
              :options="optionsModel"
              :clearable=false
              v-on:input="onChange"
            >
            </v-select>
        </div>
        <div class="m-3">
          <!-- Location Dropdown -->
          <div class="mb-2 font-weight-bold">Select Location:</div>
            <v-select
              name="loc_select"
              v-model="selectedLoc"
              label="loc_name"
              :filterable="false"
              :options="optionsLoc"
              :clearable=false
              v-on:input="onChange"
            >
            </v-select>
        </div>
        <div class="m-3">
          <div class="mb-2 font-weight-bold"><br /></div>
            <!-- Calendar/Date Picker -->
            <v-date-picker
              v-model="vDate"
              :events="arrayEvents"
              header-color="#999999"
              event-color="#ffe600"
              @change="onChange"
            ></v-date-picker>
        </div>
        <v-divider></v-divider>
        <div class="m-3">
          <!-- Export Functionality -->
          <div class="mb-2 font-weight-bold">Export Time Period:</div>
          <v-select
            name="time_select"
            v-model="selectedPeriod"
            label="period_name"
            :filterable="false"
            :options="optionsPeriod"
            :clearable=false
            v-on:input="onChangeExport"
          >
          </v-select>
          <download-csv
            class   = "btn btn-default"
            :data   = "export_data"
            name    = "safety_export.csv">

            Download CSV
          </download-csv>
        </div>
      </v-sheet>
    </v-navigation-drawer>
    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-row>
          <v-col cols="12">
            <!-- Detections Table component -->
            <v-card>
              <v-subheader> Detections </v-subheader>
              <DetectionsTable
                v-bind:detections="detections"
                @url="url($event)"
                @video_url="video_url($event)"
                @statusUpdate="statusUpdate()"
                @deleteUpdate="deleteUpdate()"
                id="detectionsTable"
              />
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card>
              <v-subheader>Media Viewer</v-subheader>
              <div>
                <!-- Image Viewer component -->
                <v-img
                  v-if="!isImageHidden"
                  class="mx-auto"
                  max-width="1500"
                  max-height="1500"
                  :src="imageSource"
                  :key="imageKey"
                ></v-img>
              </div>
              <div>
                <!-- Video Viewer component -->
                <video v-if="!isVideoHidden" ref="videoRef" :src="videoSource" :key="videoKey" id="video-container" max-width="1500" max-height="1500" controls>
                </video>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script>
//import Amplify
import { Auth, API, graphqlOperation, Storage, Hub  } from "aws-amplify";
import { components } from "aws-amplify-vue";
import { AmplifyEventBus } from "aws-amplify-vue";

//import amplify graphql operations
import * as queries from "@/graphql/queries";
import * as mutations from "@/graphql/mutations";
import * as subscriptions from "@/graphql/subscriptions";

//import components
import DetectionsTable from "../components/DetectionsTable.vue";

//import Vue Packages
import moment from "moment";

export default {
  components: {
    DetectionsTable,
  },
  data() {
    return {
      arrayEvents: [],
      optionsModel: ["All Models"],
      optionsLoc: ["All Locations"],
      optionsPeriod: ["Select Period", "Year to Date", 'Quarter to Date', 'Month to Date', 'Week to Date'],
      selectedModel: "All Models",
      selectedLoc: "All Locations",
      selectedPeriod: "Select Period",
      sub: "",
      imageSource: "",
      videoSource: "",
      detections: [],
      imageKey: 0,
      vDate: null,
      admin: null,
      reviewer: null,
      drawer: null,
      videoSrc: "",
      videoKey: 0,
      isVideoHidden: true,
      isImageHidden: true,
      export_data: []
    };
  },
  async mounted() {    
    // Gets the currently logged-in user and the user's groups
    let currentUser = await Auth.currentAuthenticatedUser();
    let currentUserGroups = currentUser.signInUserSession.idToken.payload["cognito:groups"];
    
    // Checks for the admin group 
    var listAdminGroup = await API.graphql(
      graphqlOperation(queries.listParameters, {
        filter: {
          ParameterType: {
            eq: 'admin_ad_group',
          },
        },
      })
    );
    var adminGroup = listAdminGroup.data.listSafetyComplianceParameters.items[0].ParameterValue;

    // Checks for the reviewer group
    var listReviewerGroup = await API.graphql(
      graphqlOperation(queries.listParameters, {
        filter: {
          ParameterType: {
            eq: 'reviewer_ad_group'
          }
        }
      })
    )
    var reviewerGroup = listReviewerGroup.data.listSafetyComplianceParameters.items[0].ParameterValue;

    // Populates booleans based on admin or reviewer user groups
    if (typeof currentUserGroups === "undefined") {
      this.admin = false;
    } else {
      this.admin = currentUserGroups.includes(adminGroup);
      this.reviewer = currentUserGroups.includes(reviewerGroup);
    }

    let that = this;



    // Populate Data Table
    var dateToday = new Date();
    dateToday.setTime(dateToday.getTime()-dateToday.getTimezoneOffset()*60*1000);
    dateToday = dateToday.toISOString().substr(0, 10);

    this.vDate = dateToday;

    var filter_dict = {};

    filter_dict.Timestamp = {beginsWith: dateToday};
    if (this.reviewer == true) {
      filter_dict.Status = {beginsWith: 'ESCALATE'};
    };

    const { data } = await API.graphql(
      graphqlOperation(queries.listDetections, {
        filter: filter_dict
      })
    );
    data.listDetections.items.forEach((item) => {
      this.detections.push(item);
    });

    // Populate date picker events
    var dateList = [];
    var dateListClean = [];

    var dataT = null;
    if (this.reviewer == true) {
      dataT = await API.graphql(graphqlOperation(queries.listTimestamp, {
          filter: {
            Status: {
              beginsWith: 'ESCALATE'
            }
          }
        }
      ));
    } else {
      dataT = await API.graphql(graphqlOperation(queries.listTimestamp, {}));
    }
    
    dataT.data.listDetections.items.forEach((item) => {
      dateList.push(moment.utc(String(item.Timestamp)).format("YYYY-MM-DD"));
    });

    dateListClean = new Set(dateList);
    dateListClean.forEach((item) => {
      const dd = new Date(item);
      this.arrayEvents.push(dd.toISOString().substr(0, 10));
    });

    // Populate filter drop downs
    var listLocations = await API.graphql(
      graphqlOperation(queries.listParameters, {
        filter: {
          ParameterType: {
            eq: 'camera_location',
          },
        },
      })
    );
    
    listLocations.data.listSafetyComplianceParameters.items.forEach((item) => {
      this.optionsLoc.push(item.ParameterValue);
    });

    var listModels = await API.graphql(
      graphqlOperation(queries.listParameters, {
        filter: {
          ParameterType: {
            eq: 'model_name',
          },
        },
      })
    );
    
    listModels.data.listSafetyComplianceParameters.items.forEach((item) => {
      this.optionsModel.push(item.ParameterValue);
    });
  },
  async created() {
  },
  methods: {
    async onChangeExport() {
      /*
      Queries for data to be exported from AWS DynamoDB based on the selected time period
      */
      var exportResult;
      var curr = new Date;

      var filter_dict = {};
      if (this.reviewer == true) {
        filter_dict.Status = {beginsWith: 'ESCALATE'};
      };

      if (this.selectedPeriod === "Week to Date") {
        var first = curr.getDate() - curr.getDay();
        var firstday = new Date(curr.setDate(first))
        var week_string = firstday.getFullYear() + '-' + (firstday.getMonth()+1).toString().padStart(2, '0') + '-' + firstday.getDate().toString().padStart(2, '0');

        filter_dict.Timestamp = {ge: week_string};

      } else if (this.selectedPeriod === "Month to Date") {
        var month_string = curr.getFullYear() + '-' + (curr.getMonth()+1).toString().padStart(2, '0') + '-' + '01';

        filter_dict.Timestamp = {ge: month_string};
        
      } else if (this.selectedPeriod === "Year to Date") {
        var year_string = curr.getFullYear() + '-' + '01' + '-' + '01';
        
        filter_dict.Timestamp = {ge: year_string};

      } else if (this.selectedPeriod === "Quarter to Date") {
        var current_month = curr.getMonth()+1;
        var quarter_month = 0;

        if (current_month >= 1 && current_month <= 3) {
          quarter_month = 1;
        } else if (current_month > 3 && current_month <= 6) {
          quarter_month = 4;
        } else if (current_month > 6 && current_month <= 9) {
          quarter_month = 7;
        } else if (current_month > 10 && current_month <= 12) {
          quarter_month = 10;
        };

        var quarter_string = curr.getFullYear() + '-' + (quarter_month).toString().padStart(2, '0') + '-' + '01';
        filter_dict.Timestamp = {ge: quarter_string};
      };

      exportResult = await API.graphql(
        graphqlOperation(queries.listDetections, {
          filter: filter_dict
        })
      );

      this.export_data = exportResult.data.listDetections.items;
    },
    async onChange() {
      /*
      Queries for new data to be displayed from AWS DynamoDB based on the selected location, model, and date filters
      */
      this.detections = [];
      var result;

      this.imageSource = "";
      this.imageKey += 1;

      var filter_dict = {};
      if (this.reviewer == true) {
        filter_dict.Status = {beginsWith: 'ESCALATE'};
      };

      if (this.selectedModel === "All Models") {
        if (this.selectedLoc === "All Locations") {
          filter_dict.Timestamp = {beginsWith: this.vDate};
        } else {
          filter_dict.Location = {eq: this.selectedLoc};
          filter_dict.Timestamp = {beginsWith: this.vDate};
        }
      } else {
        if (this.selectedLoc === "All Locations") {
          filter_dict.PPE = {eq: this.selectedModel};
          filter_dict.Timestamp = {beginsWith: this.vDate};
        } else {
          filter_dict.PPE = {eq: this.selectedModel};
          filter_dict.Location = {eq: this.selectedLoc};
          filter_dict.Timestamp = {beginsWith: this.vDate};
        }
      }

      result = await API.graphql(
        graphqlOperation(queries.listDetections, {
          filter: filter_dict
        })
      );

      result.data.listDetections.items.forEach((item) => {
        this.detections.push(item);
      });
    },
    async url(link) {
      /*
      Displays the selected non-compliance image
      */
      link = link.replace("public/", "");
      this.imageSource = await Storage.get(link, {  });

      this.isVideoHidden = true;
      this.isImageHidden = false;
      this.imageKey += 1;
    },
    async video_url(link) {
      /*
      Displays the selected non-compliance video
      */
      link = link.replace("public/", "");
      this.videoSource = await Storage.get(link, {  });

      this.isVideoHidden = false;
      this.isImageHidden = true;
      this.videoKey += 1;
    },
    statusUpdate() {
      /*
      Refreshes the data table after status changes
      */
      this.onChange();
    },
    deleteUpdate() {
      /*
      Refreshes the data table after item deletes
      */
      this.onChange();
    },
  },
};
</script>

<style>
#detectionsTable table thead tr th {
  background: #cccccc;
}
</style>
