export class MockResponses {

  public static customerWithParameterlessAction = JSON.parse(
    `
{
  "class": [
     "Customer"
  ],
  "title": "A Customer",
  "properties": {
     "FullName": "Grace Miranda",
     "Age": 84,
     "Address": "6th Avenue 489 Busan",
     "IsFavorite": false
  },
  "entities": [],
  "actions": [
     {
        "name": "CustomerMove",
        "title": "A Customer moved to a new location.",
        "method": "POST",
        "href": "http://localhost:5000/Customers/1/Moves",
        "type": "application/json",
        "fields": [
           {
              "name": "NewAddress",
              "type": "application/json",
              "class": [
                 "http://localhost:5000/Customers/NewAddressType"
              ]
           }
        ]
     },
     {
        "name": "MarkAsFavoriteAction",
        "title": "Marks a Customer as a favorite buyer.",
        "method": "POST",
        "href": "http://localhost:5000/Customers/MyFavoriteCustomers",
        "type": "application/json"
     }
  ],
  "links": [
     {
        "rel": [
           "Self"
        ],
        "href": "http://localhost:5000/Customers/1"
     }
  ]
}`);

  public static mockSchemaResponse = JSON.parse(
    `{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "title": "CustomerQuery",
  "additionalProperties": false,
  "properties": {
      "Pagination": {
          "oneOf": [
              {
                  "$ref": "#/definitions/Pagination"
              },
              {
                  "type": "null"
              }
          ]
      },
      "SortBy": {
          "oneOf": [
              {
                  "$ref": "#/definitions/SortParameterOfCustomerSortProperties"
              },
              {
                  "type": "null"
              }
          ]
      },
      "Filter": {
          "oneOf": [
              {
                  "$ref": "#/definitions/CustomerFilter"
              },
              {
                  "type": "null"
              }
          ]
      }
  },
  "definitions": {
      "Pagination": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
              "PageSize": {
                  "type": "integer"
              },
              "PageOffset": {
                  "type": "integer"
              }
          }
      },
      "SortParameterOfCustomerSortProperties": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
              "PropertyName": {
                  "oneOf": [
                      {
                          "$ref": "#/definitions/CustomerSortProperties"
                      },
                      {
                          "type": "null"
                      }
                  ]
              },
              "SortType": {
                  "oneOf": [
                      {
                          "$ref": "#/definitions/SortTypes"
                      }
                  ]
              }
          }
      },
      "CustomerSortProperties": {
          "type": "integer",
          "x-enumNames": [
              "Age",
              "Name"
          ],
          "enum": [
              0,
              1
          ],
          "description": ""
      },
      "SortTypes": {
          "type": "integer",
          "x-enumNames": [
              "None",
              "Ascending",
              "Descending"
          ],
          "enum": [
              0,
              1,
              2
          ],
          "description": ""
      },
      "CustomerFilter": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
              "MinAge": {
                  "type": [
                      "integer",
                      "null"
                  ]
              }
          }
      }
  }
}`);
}
