import * as React from 'react';
import { Text, Stack, TextField, IList, ScrollToMode, FontIcon, List, IconButton } from '@fluentui/react';
import { OpenAIClient } from "@azure/openai";

export interface IChatProps {
    containerWidth: number;
    containerHeight: number;
    client: OpenAIClient;
    deploymentId: string;
    systemMessage?: string;
    handleChat: (prompt: string) => void;
}

export function Chat(props: IChatProps) {

    const listRef: React.RefObject<IList> = React.useRef(null);
    const [messages, setMessages] = React.useState<{ role: string, content: string }[]>([{role: "system", content: props.systemMessage || ""}]);
    const [newMessage, setNewMessage] = React.useState<string>("");

    React.useEffect(() => {
        // Scroll to the bottom of the list when messages change
        const updatedSelectedIndex = messages.length - 1;
        listRef.current?.scrollToIndex(
            updatedSelectedIndex,
            idx => (500),
            ScrollToMode.bottom,
        );
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '') {
            // Don't send empty messages
            return;
        }
        const updatedMessages = [...messages, { content: newMessage, role: 'user' }];
        setMessages(updatedMessages);
        setNewMessage('');
        listChatCompletions(props.client, props.deploymentId, updatedMessages);
    };

    const reset = (() => {
        setMessages([{role: "system", content: props.systemMessage || ""}]);
    });

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            // Submit the message on Enter key press
            handleSendMessage();
        }
    };

    async function listChatCompletions(client: OpenAIClient, deploymentId: string, messages: { role: string, content: string }[]) {

        // Create the request
        const events = client.listChatCompletions(deploymentId, messages, { maxTokens: 500 });
        const newMessage = { role: 'assistant', content: "" };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        const newIndex = messages.length;
        let response = "";
        for await (const event of events) {
            for (const choice of event.choices) {
                const delta = choice.delta?.content;
                if (delta !== undefined) {
                    console.log(delta);
                    setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[newIndex].content += delta;
                        return updatedMessages;
                    });
                    response += delta;
                }
            }
        }
        props.handleChat(response);
    }

    return (
        <Stack tokens={{ childrenGap: 5 }} style={{ width: props.containerWidth, height: props.containerHeight, padding: 5 }} verticalAlign="end">
            <Stack.Item grow={3} style={{ overflow: 'auto' }} >
                <List items={messages} onRenderCell={onRenderCell} componentRef={listRef} />
            </Stack.Item>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <Stack.Item grow={1}>
                    <TextField
                        value={newMessage}
                        onChange={(e, newValue) => setNewMessage(newValue || "")}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                    />
                </Stack.Item>
                <IconButton iconProps={{ iconName: 'Refresh' }} onClick={reset} />
                <IconButton iconProps={{ iconName: 'Send' }} onClick={handleSendMessage} />
            </Stack>
        </Stack>
    )
}

const onRenderCell = (item: any, index: number | undefined): JSX.Element => {

    if (item.role === 'user') {
        return (
            <Stack horizontal horizontalAlign="end" style={{ marginTop: 10, marginBottom: 10 }} tokens={{ childrenGap: 10 }} verticalAlign='center'>
                <Stack style={{ marginLeft: 30, padding: 5, borderRadius: 5, boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)' }}>
                    <Text variant="mediumPlus" style={{ textAlign: 'left' }}>{item ? item.content : ""}</Text>
                </Stack>
                <FontIcon aria-label="Contact" iconName="Contact" style={{ height: 20, width: 20, fontSize: 20 }} />
            </Stack>

        );
    } else if (item.role === 'assistant') {
        return (
            <Stack horizontal horizontalAlign="start" style={{ marginTop: 10, marginBottom: 10 }} tokens={{ childrenGap: 10 }} verticalAlign='center'>
                <FontIcon aria-label="ChatBot" iconName="ChatBot" style={{ height: 20, width: 20, fontSize: 20 }} />
                <Stack style={{ padding: 5, borderRadius: 5, boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)', marginRight: 30 }}>
                    <Text variant="mediumPlus" block style={{ textAlign: 'left' }}>{item ? item.content : ""}</Text>
                </Stack>
            </Stack>
        );
    }else {
        return <></>;
    }

};



