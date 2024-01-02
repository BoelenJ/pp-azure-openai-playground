import * as React from 'react';
import { Label, Stack } from '@fluentui/react';

export interface IIncompleteProps {
    containerWidth: number;
    containerHeight: number;
}
export function Incomplete(props: IIncompleteProps) {

    return (
        <Stack tokens={{ childrenGap: 5 }} style={{ width: props.containerWidth, height: props.containerHeight, padding: 5 }}>
            <Stack.Item align="center">
                <Label>Incomplete set-up</Label>
            </Stack.Item>
        </Stack>
    )
}



