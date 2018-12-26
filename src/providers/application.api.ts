import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class ApplicationService {

    private endpoint = environment.endpoint;
    private url = this.endpoint;

    constructor(private http: HttpClient) { }

    get(token) {
      const url = this.url + '/application/user/' + environment.apiKey;

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'x-api-key': environment.apiKey,
          'Authorization': 'Bearer ' + token,
        })
      };

      return this.http.get(url, httpOptions);
    }

}
