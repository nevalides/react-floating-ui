import { insertBreak, toBoldMU, toItalicMU, toStrikethroughMU, toUnderlineMU } from "./ConverterToMarkUp";

export const TextConverterToMarkUp = ({ops}) => {
    let htmlText = ''

    if (ops.length === 0) return '';
    
    ops.forEach((operation) => {
        const opsKeys = Object.keys(operation);
        if (!opsKeys.includes('attributes')) {
            htmlText += operation?.insert ? insertBreak(operation.insert) : '';
            return;
        } else {
            let text = operation?.insert;
            const attr = Object.keys(operation.attributes);
            if (attr.includes('bold')) text = toBoldMU(text); 
            if (attr.includes('italic')) text = toItalicMU(text);
            if (attr.includes('underline')) text = toUnderlineMU(text);
            if (attr.includes('strike')) text = toStrikethroughMU(text);

            // if (attr.includes('header')) text = toHeading(text, `h${operation.attributes.header}`)
            else text = insertBreak(text);
            
            htmlText += text;
        }
    });

    return <p>{htmlText}</p>
}