import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController } from 'ionic-angular';
import { AccountService } from '../../providers/account.api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
  providers: [AccountService]
})
export class ChangePasswordPage {

    passwordObj: any = {};
    user: any = {};
    isSaving: Boolean = false;

    constructor(private accountService: AccountService, 
        private toast: ToastController,
        private navCtrl: NavController,
        private storage: Storage) {}

    getUser() {
        this.storage.get('authToken').then( token => {
            this.accountService.get(token).subscribe( data => {
                this.user = data['data'];
            });
        });
    }

    changePassword(password) {
        this.isSaving = true;
        this.storage.get('authToken').then( token => {
            this.accountService.changePassword(password, token).subscribe( data => {
                this.isSaving = false;
                let toast = this.toast.create({
                    message: 'Password has been updated successfully.',
                    duration: 3000,
                    position: 'bottom'
                });
                toast.present();
                this.navCtrl.pop();
            });
        });
    }
}