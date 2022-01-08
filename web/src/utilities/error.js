import { message } from 'antd';

export const SILENT_ERROR = Symbol("silent");
export const DISPLAY_ERROR = Symbol("display");
export const showError = (errorMessage, errorType) => {
    debugger
    if (errorType === DISPLAY_ERROR)
        message.error('There was an error processing your request');
    console.error(errorMessage);
};
