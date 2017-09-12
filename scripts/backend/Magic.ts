import * as https from "https";
import * as qs from "querystring";
import * as url from "url";

export class MTGHandler {
	constructor() {
		this.apiUrl = "https://api.scryfall.com";
		this.delay = 100;
	}

	setApiUrl(apiUrl:string):void {
		this.apiUrl = apiUrl;
	}

	setDelay(delay:number):void {
		this.delay = delay;
	}

	getApiUrl():string {
		return this.apiUrl;
	}

	getDelay():number {
		return this.delay;
	}
	
	getCard(query:string, callback: (res: any) => void):void {
		APIRequest("/cards/named?fuzzy="+encodeURIComponent(query), function(res:any) {
			callback(res);
		});
	}

	private apiUrl:string;
	private delay: number;	
}

function APIRequest(uri: string, cb: (res: any) => void, preserve: boolean = false, _partialData = []) {
  
    let parsedUrl = url.parse(uri);
    let query = qs.parse(parsedUrl.query);
    if (!query.format) {
        query.format = "json";
    }
    let reqOps = {
        host: parsedUrl.host || "api.scryfall.com",
        path: (parsedUrl.pathname || "") + "?" + qs.stringify(query),
        headers: {}
    };
    let req = https.get(reqOps, (resp) => {
        if (resp.statusCode === 429) {
            throw new Error("Too many requests have been made. Please wait a moment before making a new request.");
        }
        let responseData = "";
        resp.on("data", (chunk) => {
            responseData += chunk;
        });
        resp.on("end", () => {
            try {
                let jsonResp = JSON.parse(responseData);
                _partialData = _partialData.concat(jsonResp.data || jsonResp);
                if (jsonResp.has_more) {
                    APIRequest(jsonResp.next_page, cb, preserve, _partialData);
                }
                else {
                    if (!preserve && Array.isArray(_partialData) && _partialData.length) {
                        _partialData = _partialData[0];
                    }
                    cb(_partialData);
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    });
    req.end();
}
	
