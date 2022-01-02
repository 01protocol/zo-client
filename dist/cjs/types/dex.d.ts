export declare const DEX_IDL: {
    version: string;
    name: string;
    instructions: never[];
    events: {
        name: string;
        fields: ({
            name: string;
            type: {
                array: (string | number)[];
            };
            index: boolean;
        } | {
            name: string;
            type: string;
            index: boolean;
        })[];
    }[];
};
