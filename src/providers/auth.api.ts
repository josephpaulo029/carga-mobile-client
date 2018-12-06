import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as jwt_decode from 'jwt-decode';

import { environment } from '../environments/environment';

@Injectable()
export class AuthService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    login(data: any) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'x-api-key': environment.apiKey
            })
        };

        return this.http.post(this.url + '/account/authenticate', JSON.stringify(data), httpOptions);
    }

    decodeToken(token: string) {
        try {
            return jwt_decode(token);
        } catch(err) {
            return null;
        }
    }
}
