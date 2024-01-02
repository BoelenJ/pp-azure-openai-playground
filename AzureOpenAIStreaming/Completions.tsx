import * as React from 'react';
import { Label, Stack, TextField, DefaultButton, PrimaryButton, Separator } from '@fluentui/react';
import { OpenAIClient } from "@azure/openai";


export interface ICompletionProps {
    containerWidth: number;
    containerHeight: number;
    client: OpenAIClient;
    deploymentId: string;
    handleGenerateCompletion: (prompt: string) => void;
}

export function Completions(props: ICompletionProps) {

    const [prompt, setPrompt] = React.useState<string>("");
    const [response, setResponse] = React.useState<string>("");
    const [toggleGenerateButton, setToggleGenerateButton] = React.useState<boolean>(true);

    const onChangePrompt = React.useCallback(
        (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
            setPrompt(newValue || '');
            if (newValue === "") setToggleGenerateButton(true);
            else setToggleGenerateButton(false);
        },
        [],
    );

    const generateCompletion = (() => {
        listCompletions(props.client, props.deploymentId, [prompt], setResponse)
    })

    const reset = (() => {
        setPrompt("");
        setResponse("");
        setToggleGenerateButton(true);
    })

    async function listCompletions(client: OpenAIClient, deploymentId: string, prompt: string[], updateResponse: (response: string) => void) {
        const events = client.listCompletions(deploymentId, prompt, { maxTokens: 500 });
        let response = "";

        for await (const event of events) {
            for (const choice of event.choices) {
                response += choice.text;
                updateResponse(response);
            }
        }
        props.handleGenerateCompletion(response);
    }

    return (
        <Stack tokens={{ childrenGap: 5 }} style={{ width: props.containerWidth, height: props.containerHeight, padding: 5 }}>
            <Stack.Item align="start">
                <Label>Prompt</Label>
            </Stack.Item>
            <TextField placeholder="Please enter your prompt here" value={prompt} onChange={onChangePrompt} />
            <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }}>
                <DefaultButton text="Reset" allowDisabledFocus disabled={false} onClick={reset} />
                <PrimaryButton text="Generate" allowDisabledFocus disabled={toggleGenerateButton} onClick={generateCompletion} />
            </Stack>
            <Separator />
            <Stack.Item align="start">
                <Label>Completion</Label>
            </Stack.Item>
            <Stack.Item grow={1}>
                <TextField value={response} multiline resizable={false} readOnly styles={{ root: {}, fieldGroup: { height: props.containerHeight - 182 } }} />
            </Stack.Item>
        </Stack>
    )
}



