import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class VehicleService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    update(vehicle, token) {
        const url = this.url + '/custom-carga/vehicle/' + vehicle.vin;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token
            })
        };

        return this.http.put(url, vehicle, httpOptions);
    }

    create(vehicle, token) {
        const url = this.url + '/custom-carga/vehicle';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + token,
                'x-api-key': environment.apiKey
            })
        };

        return this.http.post(url, vehicle, httpOptions);
    }

    get(vin, token) {
        const url = this.url + '/custom-carga/vehicle/' + vin;

        const headers = new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token,
            'x-api-key': environment.apiKey
        });

        return this.http.get(url, {headers});
    }

    getNearby(params, token) {
        const url = this.url + '/custom-carga/nearby/vehicle';

        const headers = new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token,
            'x-api-key': environment.apiKey
        });

        return this.http.get(url, {headers, params});
    }

    list(params, token) {
        const url = this.url + '/custom-carga/vehicle';

        const headers = new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token,
            'x-api-key': environment.apiKey
        });

        return this.http.get(url, {headers, params});
    }

    delete(vehicle, token) {
        const url = this.url + '/custom-carga/vehicle/' + vehicle.vin;

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