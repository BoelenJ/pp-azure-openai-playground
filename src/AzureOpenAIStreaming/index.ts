import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Completions, ICompletionProps } from "./Completions";
import { Chat, IChatProps } from "./Chat";
import { Incomplete } from "./Incomplete";
import * as React from "react";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

export class AzureOpenAIStreaming implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    private response: string;

    constructor() { }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {

        const endpoint = context.parameters.Endpoint.raw || "";
        const key = context.parameters.APIKey.raw || "";
        const modelName = context.parameters.DeploymentName.raw || "";
        const baseURL = context.parameters.BaseURL.raw || "";
        const systemMessage = context.parameters.SystemMessageChat.raw || "";

        // Get width and height of the container.
        const containerWidth = parseInt(context.mode.allocatedWidth as unknown as string);
        const containerHeight = parseInt(context.mode.allocatedHeight as unknown as string);

        // If any of these is empty, don't do anything
        if (!endpoint || !key || !modelName || !baseURL) {
            return React.createElement(
                Incomplete, { containerHeight: containerHeight, containerWidth: containerWidth }
            );
        }

        // Create the client
        const client = new OpenAIClient(baseURL, new AzureKeyCredential(key));
        if (endpoint === "chat") {
            const props: IChatProps = {
                containerHeight: containerHeight,
                containerWidth: containerWidth,
                client: client,
                deploymentId: modelName,
                systemMessage: systemMessage,
                handleChat: this.handleResponse.bind(this)
            };
            return React.createElement(
                Chat, props
            )
        } else if (endpoint === "completions") {
            const props: ICompletionProps = {
                containerHeight: containerHeight,
                containerWidth: containerWidth,
                client: client,
                deploymentId: modelName,
                handleGenerateCompletion: this.handleResponse.bind(this)
            };
            return React.createElement(
                Completions, props
            )
        } else {
            return React.createElement(
                Incomplete, { containerHeight: containerHeight, containerWidth: containerWidth }
            );
        }

    }

    public getOutputs(): IOutputs {
        return {
            Response: this.response
        };
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
    }

    private handleResponse(response: string): void {
        this.response = response;
        this.notifyOutputChanged();
    }
}
