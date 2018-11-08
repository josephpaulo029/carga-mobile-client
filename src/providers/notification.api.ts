import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class NotificationService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    update(notification, token) {
        const url = this.url + '/notification/' + notification.notificationId;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.put(url, notification, httpOptions);
    }

    create(notification, token) {
        const url = this.url + '/notification';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.post(url, notification, httpOptions);
    }

    getAll(token) {
        const url = this.url + '/notification';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.get(url, httpOptions);
    }

}