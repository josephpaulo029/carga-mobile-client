import { Component, OnInit } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { AccountService } from '../../providers/account.api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  providers: [AccountService]
})
export class SettingsPage implements OnInit {

    user: any = {};
    isSuccess: Boolean = false;
    isLoading: Boolean = false;

    constructor(private accountService: AccountService,
        private navCtrl: NavController,
        private storage: Storage) {
    }

    ngOnInit() {
        this.getUser();
    }

    ionViewWillEnter() {
        this.getWithoutLoading();
    }

    getUser() {
        this.isLoading = true;
        this.storage.get('authToken').then( token => {
            this.accountService.get(token).subscribe( data => {
                this.isLoading = false;
                this.user = data['data'];
            });
        });
    }

    viewAttachments() {
        this.navCtrl.push('AttachmentsPage');
    }

    getWithoutLoading() {
        this.storage.get('authToken').then( token => {
            this.accountService.get(token).subscribe( data => {
                this.user = data['data'];
            });
        });
    }

    fileChangeEvent(event: any): void {
        this.navCtrl.push('CropPhotoPage', {
            imageChangedEvent: event,
            mode: 'account'
        });
    }

    updateUser(user) {
        this.isSuccess = false;
        this.storage.get('authToken').then( token => {
            this.accountService.update(user, token).subscribe( () => {
                this.isSuccess = true;
            });
        });
    }

    changePassword(user) {
        this.navCtrl.push('ChangePasswordPage');
    }
}