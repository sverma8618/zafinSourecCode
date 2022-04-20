import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {SuitablePackages, IZafinConfigurationProps,IProductCodes} from "./SuitablePackages";

export class SuitablePackagesControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private _context: ComponentFramework.Context<IInputs>;

  private _configProps: IZafinConfigurationProps = {
    CustomerId:"",
    Client_id: "",
    Client_secret:"",
    ZafinToken:"",
    ZafinCustomerId: "",
    ZafinSuitablePckgUrl:"",
    ZafinSubcPckgUrl:"",
    SuitableProductCodes: ""
  };

  private ProductCodes: IProductCodes = {
    ProductCode:""
  };

  // Build FetchXML to retrieve the FI Cards
  // Added a filter to only aggregate on records that are associate with same Contact Record
  // Contact Guid as Parameter
  async getFIProducts_SuitableProducts(_customerId: string) {
    let fetchXML = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true" >
                        <entity name="contact" >
                            <attribute name="fullname" />
                            <attribute name="contactid" />
                            <order attribute="fullname" descending="false" />
                            <filter type="and" >
                                <condition attribute="contactid" operator="eq" uiname="Randy Brown" uitype="contact" value="{`+_customerId+`}" />
                            </filter>
                            <link-entity name="msfsi_customerfinancialholding" from="msfsi_customerid" to="contactid" link-type="inner" alias="ag" >
                                <link-entity name="msfsi_financialholding" from="msfsi_financialholdingid" to="msfsi_financialholdingid" link-type="outer" alias="ah" >
                                    <link-entity name="msfsi_fh_loan" from="msfsi_fh_loanid" to="msfsi_details" link-type="outer" alias="fh_loan" >
                                        <attribute name="msfsi_name" />
                                        <attribute name="zafinfsi_productname" />
                                        <attribute name="zafinfsi_productcode" />
                                        <attribute name="msfsi_financialholdingtype" />
                                    </link-entity>
                                    <link-entity name="msfsi_financialholdinginstrument" from="msfsi_financialholding" to="msfsi_financialholdingid" link-type="outer" alias="aj" >
                                        <link-entity name="msfsi_fi_card" from="msfsi_fi_cardid" to="msfsi_details" link-type="outer" alias="fi_card" >
                                            <attribute name="msfsi_name" />
                                            <attribute name="zafinfsi_productcode" />
                                        </link-entity>
                                    </link-entity>
                                    <link-entity name="msfsi_fh_account" from="msfsi_fh_accountid" to="msfsi_details" link-type="outer" alias="fh_account" >
                                        <attribute name="msfsi_name" />
                                        <attribute name="msfsi_financialholdingtype" />
                                        <attribute name="zafinfsi_productcode" />
                                    </link-entity>
                                </link-entity>
                            </link-entity>
                        </entity>
                    </fetch>`;
  
    // Invoke the Web API RetrieveMultipleRecords method to get the response value
    var response = await this._context.webAPI.retrieveMultipleRecords('contact', `?fetchXml=${fetchXML}`);
    return response;
  }

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    // Add control initialization code
    this._container = container;
    this._context = context;
    this._configProps.CustomerId=context.parameters.CustomerId.raw?context.parameters.CustomerId.raw:"";
    this._configProps.Client_id=context.parameters.Client_id.raw?context.parameters.Client_id.raw:"";
    this._configProps.ZafinToken=context.parameters.ZafinToken.raw?context.parameters.ZafinToken.raw:"";
    this._configProps.Client_secret=context.parameters.Client_secret.raw?context.parameters.Client_secret.raw:"";
    this._configProps.ZafinCustomerId=context.parameters.ZafinCustomerId.raw?context.parameters.ZafinCustomerId.raw:"";
    this._configProps.ZafinSuitablePckgUrl=context.parameters.ZafinSuitablePckgUrl.raw?context.parameters.ZafinSuitablePckgUrl.raw:"";
    this._configProps.ZafinSubcPckgUrl=context.parameters.ZafinSubcPckgUrl.raw?context.parameters.ZafinSubcPckgUrl.raw:"";
     }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    
    var dataResponse=this.getFIProducts_SuitableProducts(this._context.parameters.CustomerId.raw?this._context.parameters.CustomerId.raw:"");
    dataResponse.then(
      (response: ComponentFramework.WebApi.RetrieveMultipleResponse) => {
        var productCodeResponse="";
        // Loop through each returned record
        if(response.entities.length>0)
        {
          for (const entity of response.entities) {
            // Retrieve the value of fields
            if(entity["fh_account.zafinfsi_productcode@OData.Community.Display.V1.FormattedValue"])
            {
              productCodeResponse+=entity["fh_account.zafinfsi_productcode@OData.Community.Display.V1.FormattedValue"]+',';
            }
            if(entity["fi_card.zafinfsi_productcode@OData.Community.Display.V1.FormattedValue"])
            {
              productCodeResponse+=entity["fi_card.zafinfsi_productcode@OData.Community.Display.V1.FormattedValue"]+',';
            }
            if(entity["fh_loan.zafinfsi_productcode@OData.Community.Display.V1.FormattedValue"])
            {
              productCodeResponse+=entity["fh_loan.zafinfsi_productcode@OData.Community.Display.V1.FormattedValue"]+',';
            }
          }
          this._configProps.SuitableProductCodes = productCodeResponse.replace(/,\s*$/, "");
          ReactDOM.render(
            React.createElement(SuitablePackages,this._configProps,this.ProductCodes),
            this._container
          );
        }
      },
      (errorResponse) => { }
    );
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
   // ReactDOM.unmountComponentAtNode(this._container);
  }
}
