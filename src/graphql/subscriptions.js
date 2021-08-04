/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDetections = /* GraphQL */ `
  subscription OnCreateDetections(
    $PPE: String
    $Timestamp: AWSDateTime
    $ConfidenceScore: Float
    $DetectionCount: Int
    $ImageURL: String
  ) {
    onCreateDetections(
      PPE: $PPE
      Timestamp: $Timestamp
      ConfidenceScore: $ConfidenceScore
      DetectionCount: $DetectionCount
      ImageURL: $ImageURL
    ) {
      PPE
      Timestamp
      ConfidenceScore
      DetectionCount
      ImageURL
      LastModifiedTms
      Location
      Status
      StatusApprovedBy
      StatusApprovedTms
    }
  }
`;
export const onUpdateDetections = /* GraphQL */ `
  subscription OnUpdateDetections(
    $PPE: String
    $Timestamp: AWSDateTime
    $ConfidenceScore: Float
    $DetectionCount: Int
    $ImageURL: String
  ) {
    onUpdateDetections(
      PPE: $PPE
      Timestamp: $Timestamp
      ConfidenceScore: $ConfidenceScore
      DetectionCount: $DetectionCount
      ImageURL: $ImageURL
    ) {
      PPE
      Timestamp
      ConfidenceScore
      DetectionCount
      ImageURL
      LastModifiedTms
      Location
      Status
      StatusApprovedBy
      StatusApprovedTms
    }
  }
`;
export const onDeleteDetections = /* GraphQL */ `
  subscription OnDeleteDetections(
    $PPE: String
    $Timestamp: AWSDateTime
    $ConfidenceScore: Float
    $DetectionCount: Int
    $ImageURL: String
  ) {
    onDeleteDetections(
      PPE: $PPE
      Timestamp: $Timestamp
      ConfidenceScore: $ConfidenceScore
      DetectionCount: $DetectionCount
      ImageURL: $ImageURL
    ) {
      PPE
      Timestamp
      ConfidenceScore
      DetectionCount
      ImageURL
      LastModifiedTms
      Location
      Status
      StatusApprovedBy
      StatusApprovedTms
    }
  }
`;
