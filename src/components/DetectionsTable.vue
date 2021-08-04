<template>
<div>
  <v-data-table
    id="dataTable"
    show-select
    v-model="selectedBoxes"
    :headers="headers"
    :items="detections"
    :items-per-page="10"
    :sort-by.sync="sortBy"
    :sort-desc.sync="sortDesc"
    class="elevation-1"
    item-key="Timestamp"
  >

    <!-- Template for status change dialog box -->
    <template v-slot:top>
      <v-dialog v-model="dialog" max-width="550px">
        <v-card>
          <v-card-subtitle class="p-3">
            <span class="headline">Approve/Reject</span>
          </v-card-subtitle>
          <v-card-text>
            <v-container>
              <v-row class="mx-auto">
                <v-col>
                  <div class="mx-auto">Status</div>
                  <v-select
                    name="status_select"
                    v-model="selectedStatus"
                    label="Status"
                    :filterable="false"
                    :options="optionsStatus"
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#cccccc darken-1" text @click="close"> Cancel </v-btn>
            <v-btn color="#cccccc darken-1" text @click="save"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteDialog" max-width="550px">
        <v-card>
          <v-card-subtitle class="p-3">
            <span class="headline">Click Save to Confirm Item Deletion</span>
          </v-card-subtitle>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#cccccc darken-1" text @click="close"> Cancel </v-btn>
            <v-btn color="#cccccc darken-1" text @click="deleteSave"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>


    <!-- Template for image URL -->
    <template #item.ImageURL="{ item }">
      <a href="#" @click="url(item.ImageURL)" class="link"> View </a>
    </template>

    <!-- Template for video URL -->
    <template #item.VideoURL="{ item }">
      <a href="#" @click="video_url(item.ImageURL.replace('images','videos').replace('.jpg', '.webm'))" class="link"> View </a>
    </template>

    <!-- Template for Timestamp -->
    <template #item.Timestamp="{ value }">
        {{ value.substring(11,19) }}
    </template>

    <!-- Template for Status Update icon -->
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mx-auto" @click="editItem(item)"> mdi-pencil </v-icon>
    </template>

    <!-- Template for Confidence Score -->
    <template #item.ConfidenceScore="{ value }">
        <span v-if="value >= .80">High</span>
        <span v-if="value >= .50 && value < .80">Medium</span>
        <span v-if="value < .50">Low</span>
    </template>

    <!-- Template for Status Approved By -->
    <template #item.StatusApprovedBy="{ value }">
      {{ value | clean_username}}
    </template>

    <!-- Template for Delete Item icon -->
    <template v-slot:item.delete="{ item }">
      <v-icon small class="mx-auto" @click="deleteItem(item)"> mdi-cancel </v-icon>
    </template>
  </v-data-table>


  <v-container>
  <v-btn @click=deleteSelected>Delete Selected</v-btn>
  </v-container>


  </div>
</template>

<script>
//import Amplify
import { Auth, API, graphqlOperation } from "aws-amplify";
import { components } from "aws-amplify-vue";
import { AmplifyEventBus } from "aws-amplify-vue";

//import amplify graphql operations
import * as queries from "@/graphql/queries";
import * as mutations from "@/graphql/mutations";
import * as subscriptions from "@/graphql/subscriptions";

export default {
  name: "DetectionsTable",
  props: ["detections"],
  data() {
    return {
      selectedBoxes: [],
      headers: [],
      sortBy: "Timestamp",
      sortDesc: true,
      editedIndex: -1,
      deleteIndex: -1,
      editedItem: {
        Status: "",
      },
      dialog: false,
      deleteDialog: false,
      detectionObject: [],
      selectedStatus: "",
      optionsStatus: ["APPROVE", "REJECT", "ESCALATE"],
      signedInUser: "",
    };
  },
  async mounted() {
    //Get the current logged in user
    let currentUser = await Auth.currentAuthenticatedUser();
    let currentUserGroups = currentUser.signInUserSession.idToken.payload["cognito:groups"];
    let admin = false;

    this.signedInUser = currentUser;

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

    if (typeof currentUserGroups === "undefined") {
      admin = false;
    } else {
      admin = currentUserGroups.includes(adminGroup);
    }

    // Displays the status update column if part of the admin group
    if (admin === true) {
      this.headers = [
        {
          text: "Location",
          align: "start",
          value: "Location",
          sortable: false,
        },
        { text: "PPE", value: "PPE" },
        { text: "Time", value: "Timestamp" },
        { text: "Confidence Score", value: "ConfidenceScore", sortable: false },
        { text: "Image Frame", value: "ImageURL", sortable: false },
        { text: "Video Link", value: "VideoURL", sortable: false },
        { text: "Status", value: "Status", sortable: false },
        {
          text: "Status Modified by",
          value: "StatusApprovedBy",
          sortable: false,
        },
        { text: "Update Status", value: "actions", sortable: false },
        { text: "Delete", value: "delete", sortable: false },
      ];
    } else {
      this.headers = [
        {
          text: "Location",
          align: "start",
          value: "Location",
          sortable: false,
        },
        { text: "PPE", value: "PPE" },
        { text: "Time", value: "Timestamp" },
        { text: "Confidence Score", value: "ConfidenceScore", sortable: false },
        { text: "Image Frame", value: "ImageURL", sortable: false },
        { text: "Video Link", value: "VideoURL", sortable: false },
        { text: "Status", value: "Status", sortable: false },
      ];
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    deleteDialog(val) {
      val || this.closeDelete();
    },
  },
  methods: {
    // emits the image url to the Detections handler if an image link is clicked
    url: function (link) {
      this.$emit("url", link);
    },
    // emits the video url to the Detections handler if a video link is clicked
    video_url: function(link) {
      this.$emit("video_url", link);
    },
    // makes the status update visible when the status edit icon is clicked
    editItem: function (item) {
      this.editedIndex = this.detections.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    // handles item delete  when the delete icon is clicked
    deleteItem: function (item) {
      this.deleteIndex = this.detections.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.deleteDialog = true;
    },
    // closes the dialog box
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.deleteIndex = -1;
        this.selectedStatus = "";
      });
    },
    closeDelete() {
      this.deleteDialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.deleteIndex = -1;
        this.selectedStatus = "";
      });
    },
    // saves the status updates to DynamoDB
    async save() {
      let currTimestamp = this.editedItem.Timestamp;
      let currPPE = this.editedItem.PPE;
      let currStatus = this.selectedStatus;

      let tms = new Date();
      tms.setTime(tms.getTime() - tms.getTimezoneOffset() * 60 * 1000);
      tms = tms.toISOString();

      const { data } = await API.graphql(
        graphqlOperation(mutations.updateDetections, {
          input: {
            Timestamp: currTimestamp,
            PPE: currPPE,
            Status: this.selectedStatus,
            StatusApprovedBy: this.signedInUser.username,
            StatusApprovedTms: tms,
            LastModifiedTms: tms,
          },
        })
      );

      this.close();
      this.$emit("statusUpdate");
    },
    // Deletes the item from DynamodbDB
    async deleteSave() {
      let currTimestamp = this.editedItem.Timestamp;
      let currPPE = this.editedItem.PPE;

      const { data } = await API.graphql(
        graphqlOperation(mutations.deleteDetections, {
          input: {
            Timestamp: currTimestamp,
            PPE: currPPE,
          },
        })
      );

      this.closeDelete();
      this.$emit("deleteUpdate");
    },
    async deleteSelected() {

      for (const x of this.selectedBoxes) {
        let currTimestamp = x.Timestamp;
        let currPPE = x.PPE;

        const { data } = await API.graphql(
          graphqlOperation(mutations.deleteDetections, {
            input: {
              Timestamp: currTimestamp,
              PPE: currPPE,
            },
          })
        );
      }

      this.$emit("deleteUpdate");
    }
  },
};
</script>
