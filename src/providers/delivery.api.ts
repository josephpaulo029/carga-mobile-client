import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class DeliveryService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    update(notification, token) {
        const url = this.url + '/notification';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.put(url, notification, httpOptions);
    }

    create(delivery, token) {
        const url = this.url + '/custom-carga/delivery';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.post(url, delivery, httpOptions);
    }

    getAll(params, token) {
        const url = this.url + '/custom-carga/delivery/client';

        const headers = new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token,
            'x-api-key': environment.apiKey
        })

        return this.http.get(url, {headers, params});
    }

}