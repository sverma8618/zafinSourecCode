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
  }
};

interface SuitablePackages {
  ModelType: string;
  packageCode: string;
  packageName: string;
  packageDescription: string;
}

export interface SuitableProduct {
  modelType: string;
  productCode: string;
  productName: string;
  productDescription: string;
  productType: string;
  IsExist: boolean
}

export interface ProductsJson {
  modelType: string;
  eventStatus: string;
  message: string;
  suitableProducts: SuitableProduct[];
  errorCode: number;
}

export interface SuitableProductsResponse {
  requestDate: string;
  durationMs: number;
  dataType: string;
  dataCount: number;
  data: ProductsJson[];
}

export interface IAddProductButton {
  // These are set based on the toggles shown above the examples (not needed in real code)
  disabled?: boolean;
}

export interface IProductCodes {
  ProductCode: string[],
};

export interface attributeValuePairForPcodes {
  attributeName: string,
  attributeValue: string,
}

export interface IProductsResult {
  ProductCode: string,
  IsExist: boolean,
}

export interface IZafinConfigurationProps {
  CustomerId: string,
  ZafinCustomerId: string,
  Client_id: string;
  Client_secret: string;
  PowerAutomateUrl: string;
  ZafinTokenApiUrl: string;
  ZafinSuitableProductsUrl: string;
  ZafinEventCode: ZafinLifeEvents[],
  FIProducts: string[]
};

export interface ZafinLifeEvents {
  LifeEventName: string;
  LifeEventCode: string;
}

export interface IprodStatus {
  // These are set based on the toggles shown above the examples (not needed in real code)
  visible?: boolean;
}

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

export function SuitableProducts(configProps: IZafinConfigurationProps, productCodes: IProductCodes): JSX.Element {
  // This is just for laying out the label and spinner (spinners don't have to be inside a Stack)
  const rowProps: IStackProps = { horizontal: true, verticalAlign: 'center' };

  const [isProductsAvailable, setisProductsAvailable] = useState(false);
  let suitableProducts: SuitableProduct[] = [];
  const [responseOfsuitableProducts, setGetSuitableProducts1] = useState(suitableProducts);
  const [disableByBtnId, setDisableByBtnId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  var _messageBar = { 'isSuccess': 'false', 'Message': '' };
  const [messageBarProps, setMessageBarProps] = useState(_messageBar);

  function ShowNotification(messageType: string, message: string) {
    var _msgResponse = { 'isSuccess': messageType, 'Message': message };
    setMessageBarProps(_msgResponse);
    setTimeout(() => {
      var _message = { 'isSuccess': 'false', 'Message': '' };
      setMessageBarProps(_message);
    }, 6000);
    setIsLoading(false);
  }

  async function AddProduct(custid: string, url: string, _productCode: string, _productName: string, _productType: string) {
    //debugger;
    setIsLoading(true);
    var jsonBody = {
      "RequestType": "pcf",
      "ProductName": _productName,
      "ProductCode": _productCode,
      "ProductType": _productType,
      "ContactId": custid
    };

    await fetch(url,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(jsonBody),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.Status === true) {
          setDisableByBtnId('btn_' + _productCode)
          var successMessage = { 'isSuccess': 'success', 'Message': response.Message };
          setMessageBarProps(successMessage);
        }
        else {
          var error = { 'isSuccess': 'error', 'Message': response.Message };
          setMessageBarProps(error);
        }
        setIsLoading(false);
        setTimeout(() => {
          var _message = { 'isSuccess': 'false', 'Message': '' };
          setMessageBarProps(_message);
        }, 6000);
      })
      .catch((err) => {
        ShowNotification('success', "Unable to add suitable products at this time, kindly try again later.");
      });

  }

  async function getSutaibleProducts(bearerToken: string) {
    setIsLoading(true);
    var tempDate = new Date();
    var currDate = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
    var customerProductCodes: attributeValuePairForPcodes[] = [];

    if (configProps.ZafinEventCode.length > 0) {
      configProps.ZafinEventCode.map((pCode) => {
        customerProductCodes.push({
          "attributeName": "lifeEvent",
          "attributeValue": pCode.LifeEventCode
        });
      })
    }
    else {
      customerProductCodes.push({
        "attributeName": "lifeEvent",
        "attributeValue": ""
      });
    }
    var jsonBody = {
      effectiveDate: currDate,
      attributeValuePair: customerProductCodes,
    };
    const response = await fetch(
      configProps.ZafinSuitableProductsUrl,
      {
        headers: {
          Authorization: "Bearer " + bearerToken,
          "Content-Type": "application/vnd.zafin+json",
        },
        method: "POST",
        body: JSON.stringify(jsonBody),
      }
    );
    const SutaibleProductsResponse = await response.json();
    setIsLoading(false);
    return SutaibleProductsResponse;

  }

  async function getToken() {
    const response = await fetch(configProps.ZafinTokenApiUrl, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: "POST",
      body: 'grant_type=client_credentials&client_id=' + configProps.Client_id + '&client_secret=' + configProps.Client_secret
    });
    const tokenResponse = await response.json();
    return tokenResponse;
  }

  useEffect(() => {
    //debugger;
    if (configProps.ZafinEventCode.length == 0) {
      //Section for checking if Zafin Event is available i.e UE(University Enrrolment)
      ShowNotification('success', "There is no life event code.");
    }
    else {
      if (configProps.ZafinEventCode[0].LifeEventCode === undefined) {
        //Section for checking if Zafin Event is available i.e UE(University Enrrolment)
        ShowNotification('success', "There is no life event code for " + configProps.ZafinEventCode[0].LifeEventName + ".");
      }
      else {
        getToken().then(tokenResponse => {
          getSutaibleProducts(tokenResponse.access_token).then(SutaibleProductsResponse => {
            var suitableProdResponse = SutaibleProductsResponse.data[0];
            if (suitableProdResponse.errorCode === 0) {

              var _productResult: SuitableProduct[] = [];

              if (suitableProdResponse.suitableProducts.length > 0) {
                suitableProdResponse.suitableProducts.forEach((newProduct: SuitableProduct) => {
                  if (configProps.FIProducts.length > 0) {

                    if (configProps.FIProducts.includes(newProduct.productCode)) {
                      _productResult.push({
                        "modelType": newProduct.modelType,
                        "productCode": newProduct.productCode,
                        "productName": newProduct.productName,
                        "productDescription": newProduct.productDescription,
                        "productType": newProduct.productType,
                        "IsExist": true
                      })
                    }
                    else {
                      _productResult.push({
                        "modelType": newProduct.modelType,
                        "productCode": newProduct.productCode,
                        "productName": newProduct.productName,
                        "productDescription": newProduct.productDescription,
                        "productType": newProduct.productType,
                        "IsExist": false
                      })
                    }
                  }
                  else {
                    _productResult.push({
                      "modelType": newProduct.modelType,
                      "productCode": newProduct.productCode,
                      "productName": newProduct.productName,
                      "productDescription": newProduct.productDescription,
                      "productType": newProduct.productType,
                      "IsExist": false
                    })
                  }
                });
                setisProductsAvailable(true);
              }
              else {
                setisProductsAvailable(false);
              }
              setGetSuitableProducts1(_productResult);

            } else {
              setisProductsAvailable(false);
              ShowNotification('success', "No Suitable Products.");
            }
          }).catch((err) => {
            ShowNotification('error', "Suitable Products are currently unavailable.");
          });
        }).catch((err) => {
          ShowNotification('error', "Authentication is unavailable.");
        });
      }
    }
  }, []);

  return (
    <div>
      <React.StrictMode>
        <div style={{ display: messageBarProps.isSuccess === 'false' ? "none" : "block" }}>
          {<MessageBar messageBarType={messageBarProps.isSuccess === 'success' ? MessageBarType.success : MessageBarType.error} isMultiline={false} >
            {messageBarProps.Message}
          </MessageBar>}
        </div>
        <Stack data-is-focusable={true} role="listitem" className="suitableProductsSection">

          <div style={{ display: isLoading ? "block" : "none" }}>
            <Spinner label="Loading Please wait..." ariaLive="assertive" labelPosition="bottom" size={SpinnerSize.large} > </Spinner>
          </div>

          <div style={{ display: isLoading ? "none" : "block" }}>
            <div>
              <h3>Suitable Products</h3>
            </div>
            <div style={{ display: isProductsAvailable ? "none" : "block" }}>
              <DocumentCardDetails className="cardDetail">
                <DocumentCardTitle
                  title="No Suitable Products."
                  shouldTruncate
                />
              </DocumentCardDetails>
            </div>

            <div style={{ display: isProductsAvailable ? "block" : "none" }}>
              {

                responseOfsuitableProducts.map((product) => (
                  <DocumentCard styles={cardStyles}>
                    <div >
                      <DocumentCardDetails className="cardDetail">
                        <DocumentCardTitle
                          title={product.productName + " (" + product.productCode + ")"}
                          shouldTruncate
                          styles={styles.titleHeader}
                        />
                        {<Card.Item grow>{product.productDescription}</Card.Item>}
                      </DocumentCardDetails>
                      <div>
                        <Stack className="btnSection">
                          <PrimaryButton text="Add Product" disabled={product.IsExist || disableByBtnId === 'btn_' + product.productCode} id={'btn_' + product.productCode} onClick={() => AddProduct(configProps.CustomerId, configProps.PowerAutomateUrl, product.productCode, product.productName, product.productType)} />
                        </Stack>
                      </div>
                    </div>
                  </DocumentCard>
                ))
              }
            </div>
          </div>
        </Stack>
      </React.StrictMode>
    </div>
  );
};




