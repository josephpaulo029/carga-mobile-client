import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class PricingService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    get(params, token) {
        const url = this.url + '/custom-carga/delivery-transaction-amount';

        const headers = new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token,
            'x-api-key': environment.apiKey
        });

        return this.http.get(url, {headers, params});
    }
}