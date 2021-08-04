/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDetections = /* GraphQL */ `
  query GetDetections($PPE: String!, $Timestamp: AWSDateTime!) {
    getDetections(PPE: $PPE, Timestamp: $Timestamp) {
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
export const listDetections = /* GraphQL */ `
  query ListDetections(
    $filter: TableDetectionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDetections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const listTimestamp = /* GraphQL */ `
  query listTimestamp(
    $filter: TableDetectionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDetections (filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        Timestamp
      }
    }
  }
`;
export const listParameters = /* GraphQL */ `
  query ListSafetyComplianceParameters(
    $filter: TableSafetyComplianceParametersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSafetyComplianceParameters(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        ParameterType
        ParameterValue
      }
      nextToken
    }
  }
`;