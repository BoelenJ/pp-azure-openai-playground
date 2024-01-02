# Power Platform - Azure OpenAI Playground

This repository contains a playground solution that showcases how easy it is to implement Azure OpenAI services in Power Apps. The solution also contains an __experimental__ PCF control that allows for using the streaming functionality that Azure OpenAI offers. For details on this PCF control, see the PCF control section below.

The solution contains the following components:
- A canvas app that allows you to test the following models: completions, chat, DALL-E and whisper.* 
- A custom connector that is used to connect with Azure OpenAI from the canvas app.
- A cloud flow and Dataverse table to support Dall-E and save the generated images in Dataverse.
- Two environment variables for setting up the base URL of the connector and the credentials for the PCF control.
- A custom PCF control that allows for streaming when using either chat or completions.

> The supported models depend on your Azure OpenAI deployment. For example, at the moment of writing, my deployment supports whisper, but it does not support DALL-E, so DALL-E will fail.

## The PCF Control

Currently, Power Apps and custom connectors do not support streaming, where the response is sent in chunks once they become available instead of sending the full response after it is fully generated. As an experiment, this solution contains a PCF control that does allow for this streaming functionality (see ./src). The set-up of this component is as follows:

### Input values
| Name | Description |
| ---- | ----------- |
| BaseURL | The BaseURL of your Azure OpenAI instance, this is needed for calling the API from the component. In the demo canvas app, this will be pulled from the BaseURL environment variable and passed to the component. |
| APIKey | Credentials for connecting with your Azure OpenAI instance. In the demo canvas app, this will be pulled from the APIKey environment variable and passed to the component. |
| DeploymentName | Name of your model deployment. |
| Endpoint | Either "chat" or "completions". This will dictate which endpoint will be called and how the UI will be rendered. | 
| SystemMessageChat | In case of "chat" as endpoint, this input value allows you to add a system message chat to instruct how the model should act. | 

### Output values

| Name | Description |
| ---- | ----------- |
| Response | The latest response, will only be filled once the entire response is completed (so after all message chunks are received). The component itself already renders the responses, but this can be used if you want to use the value elsewhere in the application. |

### Security
This PCF is really experimental and the main reason for this is the security aspect. The API calls are made from the PCF itself, which poses a potential security issue. However, at this moment, there is no alternative way to call the API and still have the streaming functionality (to my knowledge). Any ideas or tips are welcome!

So please keep in mind that this PCF is currently __not recommended__ to use in an actual solution, but it mostly serves as an example of what streaming could look like in Power Apps. 

> Due to the security limitations, the PCF is currently __not recommended__ to use in an actual solution, hopefully this will change soon.


## How to deploy the project


### Prerequisites
- A Power Platform environment which allows PCF components to be used. You can turn on this setting in the admin center of the Power Platform as follows: 
  - Go to the target environment in the Power Platform admin center.
  - Select settings -> product -> features.
  - Enable "Allow publishing of canvas apps with code components".
- An Azure OpenAI deployment.

### Import the solution
Simply import the solution via the Power Apps UI. This will ask you to supply a connection reference for dataverse and to fill in 2 environment variables:

- __Azure OpenAI BaseURL__: This url will be used in the custom connector to connect to your Azure OpenAI instance. Make sure to omit the https://, so, as an example:
    - If your endpoint is https://powerplatform-playground.openai.azure.com/, fill in powerplatform-playground.openai.azure.com.
- __Azure OpenAI API Key__: As mentioned in the PCF section, this will be used by the PCF to connect to Azure OpenAI. Only supply this if you intend to test out the PCF control, if not, you can leave this empty. __NOTE__: The custom connector also requires the API key, but this will be handled by the connection you need to set up, not the environment variable.

After importing the solution, you should be able to play the app and start testing the APIs. Note that for each API, you need to specify the model name of your model deployment on the right hand side of the screen as this is needed for constructing the url of the request.

### Updating the Azure OpenAI instance
In case you want to switch to another Azure OpenAI instance, you need to perform the following steps:
1. Update the Azure OpenAI BaseURL environment variable.
2. (Optional) Update the Azure OpenAI API Key environment variable.
3. Open the custom connector in edit mode and press "Update connector" to make sure the new BaseURL environment variable is reflected properly in the custom connector.
4. Alter your connection and update it to your new API Key (my connections -> OpenAI - Azure -> edit.)
