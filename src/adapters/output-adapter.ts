import { Output } from "../ports/output";
import { write } from "./export-csv";

let outputAdapter: Output | null = null;

const createOutputAdapter = (): Output => {
    outputAdapter = {
        write
    };

    return outputAdapter;
}

export const getOutputAdapter = (): Output => {
    return outputAdapter || createOutputAdapter();
}