export const toBoldMU = (context) => `<strong>${context}</strong>`
export const toItalicMU = (context) => `<em>${context}</em>`
export const toUnderlineMU = (context) => `<u>${context}</u>`
export const toStrikethroughMU = (context) => `<s>${context}</s>`

export const insertBreak = (content = '') => content.replaceAll('\n', '<br>');