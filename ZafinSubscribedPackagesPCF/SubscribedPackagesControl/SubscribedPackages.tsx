import * as React from "react";
import { useState, useEffect } from "react";
import { IStackProps, Stack, IStackStyles } from "@fluentui/react/lib/Stack";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { Card } from "@uifabric/react-cards";
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import {
  DocumentCard,
  DocumentCardDetails,
  DocumentCardTitle,
  IDocumentCardStyles,
} from "@fluentui/react/lib/DocumentCard";

const container = {
  display: "flex",
  justifyContent: "start",
  margin: "1vh 0",
};

const cardStyles: IDocumentCardStyles = {
  root: { display: "inline-block", marginRight: 20, marginTop: "2vh", width: 320 },
};

const icon = {
  fontSize: 24,
  padding: 15,
  verticalAlign: "middle",
  paddingLeft: 0,
  color: "#0078d4",
};

const styles = {
  cardStyles: {
    root: {
      background: 'white',
      padding: 20,
      borderTop: '5px solid #0078d4',
      width: '90%',
      maxWidth: '90%',
      margin: 'auto',
    },
  },
  header: {
    root: {
      fontSize: 20,
      fontWeight: "bold",
    },
  },
  titleHeader: {
    root: {
      fontSize: 15,
      fontWeight: "bold",
    },
  },
  description: {
    root: {
      fontSize: 15,
    },
  },
};

interface Packages {
  packageCode: string;
  packageName: string;
  packageDescription: string;
}

export interface ResolvedPackageResponse {
  timestamp: number;
  status: string;
  suitablePackages: Packages[];
  subscribedPackages: Packages[];
  message: string;
  errors: string[];
}


export interface IUnsubscribeButton {
  // These are set based on the toggles shown above the examples (not needed in real code)
  disabled?: boolean;
  checked?: boolean;
}


export interface IZafinConfigurationProps {
  Client_id: string;
  Client_secret: string;
  CustomerId: string,
  ZafinCustomerId: string,
  SubscribedProductCodes: string;
  ZafinSuitablePckgUrl: string;
  ZafinUnSubcPckgUrl: string;
  ZafinToken: string;
};

export interface IMessageBar {
  isSuccess: string;
  Message: string;
}

const stackTokens = { childrenGap: 50 };
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};


export function SubscribedPackages(configProps: IZafinConfigurationProps): JSX.Element {

  const [isPackagesAvailable, setisPackagesAvailable] = useState(false);
  const [disableByBtnId, setDisableByBtnId] = useState('');
  const resolvedPackageResponse: ResolvedPackageResponse = {
    timestamp: 0,
    status: "string",
    suitablePackages: [],
    subscribedPackages: [],
    message: "string",
    errors: [],
  };
  const [responseOfResolvedPackages, setGetResolvedPackages] = useState(resolvedPackageResponse);
  const [isLoading, setIsLoading] = useState(false);
  var _messageBar = { 'isSuccess': 'false', 'Message': '' };
  const [messageBarProps, setMessageBarProps] = useState(_messageBar);
  var TokenData = "";
  function ShowNotification(messageType: string, message: string) {
    var _messageResponse = { 'isSuccess': messageType, 'Message': message };
    setMessageBarProps(_messageResponse);
    setTimeout(() => {
      var _message = { 'isSuccess': 'false', 'Message': '' };
      setMessageBarProps(_message);
    }, 6000);
    setIsLoading(false);
  }
  // async function getToken() {
  //   const response = await fetch(configProps.ZafinTokenApiUrl, {
  //     headers: {
  //       'Authorization':'Basic emFmaW5fY2k6emFmaW5fY2k=',
  //       'grant_type':'client_credentials',
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     method: "POST",
  //     body: 'grant_type=client_credentials&client_id='+configProps.Client_id+'&client_secret='+configProps.Client_secret
  //   });
  //  const tokenResponse = await response.json();

  //   return tokenResponse;
  // }


  async function getResolvedPackages(bearerToken: string, customerId: string) {
    setIsLoading(true);
    var jsonBody = {
      "customerId": customerId,
      "subscriptionFlag": "Y",
      "suitabilityAttributeValuePair": [
        {
          "attributeName": "productCode",
          "attributeValue": configProps.SubscribedProductCodes
        }
      ]
    };

    const response = await fetch(configProps.ZafinSuitablePckgUrl,
      {
        headers: {
          Authorization: "Bearer " + bearerToken,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(jsonBody),
      }
    );
    const SuitablePackagesResponse = await response.json();
    setIsLoading(false);
    return SuitablePackagesResponse;
  }

  function UnsubscribePackage(custid: string, packageCode: string, subscriptionValue: string): void {
    setIsLoading(true);


    var token = configProps.ZafinToken;
    var url = configProps.ZafinUnSubcPckgUrl;
    var jsonBody = JSON.stringify({
      "customerId": custid,
      "packageCode": packageCode,
      "subscriptionValue": subscriptionValue
    });
    fetch(url,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: jsonBody,
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setDisableByBtnId('btn_' + packageCode)
        var successMessage = { 'isSuccess': 'success', 'Message': response.status };
        setMessageBarProps(successMessage);
        getResolvedPackages(token, custid);
        setIsLoading(false);
        setTimeout(() => {
          var _message = { 'isSuccess': 'false', 'Message': '' };
          setMessageBarProps(_message);
        }, 4000);
      })
      .catch((err) => {
        ShowNotification('error', "Unable to Unsubscribe the package at this time, kindly try again later.");
      });
  }

  useEffect(() => {

    if (configProps.SubscribedProductCodes) {
      var tokenResponse = configProps.ZafinToken;

      getResolvedPackages(tokenResponse, configProps.ZafinCustomerId).then(resolvedPackageResponse => {
        //if (!resolvedPackageResponse.hasOwnProperty('errors') && resolvedPackageResponse.hasOwnProperty('subscribedPackages') ) {
        if (resolvedPackageResponse.errors == undefined && resolvedPackageResponse.response.suitablePackages != undefined) {
          if (resolvedPackageResponse.response.subscribedPackages.length > 0) {
            setGetResolvedPackages(resolvedPackageResponse.response);
            setisPackagesAvailable(true);
          }

          else {
            setisPackagesAvailable(false);
            ShowNotification('success', "No Subscribed Packages.");
          }
        }
        else if (resolvedPackageResponse.errors == undefined && resolvedPackageResponse.response.subscribedPackages != undefined) {
          if (resolvedPackageResponse.response.subscribedPackages.length > 0) {
            setGetResolvedPackages(resolvedPackageResponse.response);
            setisPackagesAvailable(true);
          }

          else {
            setisPackagesAvailable(false);
            ShowNotification('success', "No Subscribed Packages.");
          }
        }
        else {
          setisPackagesAvailable(false);
          ShowNotification('success', "No Subscribed Packages.");
        }
      }).catch((err) => {
        ShowNotification('error', "Subscribed Packages are currently unavailable.");
      });

    }
    else {
      //If Zafin cards or accounts are not available
    }
  }, []);

  return (
    <div>
      <div style={{ display: messageBarProps.isSuccess === 'false' ? "none" : "block" }}>
        {<MessageBar messageBarType={messageBarProps.isSuccess === 'success' ? MessageBarType.success : MessageBarType.error} isMultiline={false} >
          {messageBarProps.Message}
        </MessageBar>}
      </div>
      <Stack data-is-focusable={true} role="listitem" className="ResolvedPackageSection">
        <div style={{ display: isLoading ? "block" : "none" }}>
          <Spinner label="Loading Please wait..." ariaLive="assertive" labelPosition="bottom" size={SpinnerSize.large} > </Spinner>
        </div>
        <div style={{ display: isLoading ? "none" : "block" }}>


          <div>
            <h3>Subscribed Packages</h3>
          </div>
          <div style={{ display: isPackagesAvailable ? "none" : "block" }}>
            <DocumentCardDetails className="cardDetail">
              <DocumentCardTitle
                title="No Subscribed Packages."
                shouldTruncate
              />
            </DocumentCardDetails>
          </div>

          <div style={{ display: isPackagesAvailable ? "block" : "none" }}>
            {
              responseOfResolvedPackages.subscribedPackages.map((subscribedPackagesItem) => (
                <DocumentCard styles={cardStyles}>
                  <div >
                    <DocumentCardDetails className="cardDetail">
                      <DocumentCardTitle
                        title={subscribedPackagesItem.packageName + " (" + subscribedPackagesItem.packageCode + ")"}
                        shouldTruncate
                        styles={styles.titleHeader}
                      />
                      {
                        <Card.Item grow>{subscribedPackagesItem.packageDescription}</Card.Item>
                      }
                    </DocumentCardDetails>
                    <div>
                      <Stack className="btnSection">
                        <PrimaryButton disabled={disableByBtnId == 'btn_' + subscribedPackagesItem.packageCode} text="Unsubscribe" onClick={() =>
                          UnsubscribePackage(configProps.ZafinCustomerId, subscribedPackagesItem.packageCode, "UNSUBSCRIBE")} />
                      </Stack>
                    </div>
                  </div>
                </DocumentCard>
              ))
            }
          </div>


        </div>


      </Stack>
    </div>
  );

};
