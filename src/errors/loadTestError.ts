/*
 * A simple error entity for our load test
 */
export class LoadTestError extends Error {

    // The error code
    private _errorCode: string;

    // Details
    private _details: any;

    // Stack details when this sample's code goes wrong
    private _stackFrames: string[];

    /*
     * All client errors have a status, an error code and a message
     */
    public constructor(errorCode: string, message: string) {

        // Initialise fields
        super(message);
        this._errorCode = errorCode;
        this._details = null;
        this._stackFrames = [];

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public getErrorCode(): string {
        return this._errorCode;
    }

    public setDetails(value: any) {
        this._details = value;
    }

    /*
     * Form a string representation
     */
    public toString(): string {

        const data: any = {
            message: this.message,
            errorCode: this._errorCode,
        };

        if (this._details) {
            data.details = this._details;
        }
        if (this._stackFrames.length > 0) {
            data.stack = this._stackFrames;
        }

        return JSON.stringify(data, null, 2);
    }

    /*
     * Set stack details for exceptions
     */
    public addStackFrames(stack: string): void {

        if (this.stack) {
            const items = stack.split('\n').map((x: string) => x.trim()) as string[];
            items.forEach((i) => {
                this._stackFrames.push(i);
            });
        }
    }
}
