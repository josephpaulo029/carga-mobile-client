import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions, URLSearchParams} from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class DevicesService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    list(type: string, mode: string, token) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.get(this.url + '/' + mode + '/' + type, httpOptions);
    }

    create(type: string, data: any, mode: string, token) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.post(this.url + '/' + mode + '/' + type, JSON.stringify(data), httpOptions);
    }

    update(type: string, device: string, mode: string, token) {
        const url = this.url + '/' + mode + '/' + type + '/' + device['deviceId'];

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.put(url, device, httpOptions);
    }

    delete(type: string, id: string, mode: string, token) {
        const url = this.url + '/' + mode + '/' + type + '/' + id;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.delete(url, httpOptions);
    }
}