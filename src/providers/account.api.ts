import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class AccountService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    update(user, token) {
        const url = this.url + '/account';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token
            })
        };

        return this.http.put(url, user, httpOptions);
    }

    create(user) {
        const url = this.url + '/account';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'x-api-key': environment.apiKey
            })
        };

        return this.http.post(url, user, httpOptions);
    }

    get(token) {
        const url = this.url + '/account';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token
            })
        };

        return this.http.get(url, httpOptions);
    }

    getAll(token) {
        const url = this.url + '/admin/accounts';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token
            })
        };

        return this.http.get(url, httpOptions);
    }

    changePassword(password, token) {
        const url = this.url + '/change-password';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.put(url, password, httpOptions);
    }

}