import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';

import { HomePage, PackagesPage, SettingsPage, NotificationsPage } from '../';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
    home: any = HomePage;
    packages: any = PackagesPage;
    settings: any = SettingsPage;
    notifications: any = NotificationsPage;

    constructor(public navCtrl: NavController) {

    }
}
