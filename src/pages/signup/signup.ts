import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController } from 'ionic-angular';
import { AccountService } from '../../providers/account.api';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  providers: [AccountService]
})
export class SignupPage {

    user: any = {
        custom: {}
    };
    isLoading: Boolean = false;

    constructor(public navCtrl: NavController, 
        private toast: ToastController,
        private accountService: AccountService) {}

    login() {
        this.navCtrl.push('LoginPage');
    }

    signUp(user) {
        this.isLoading = true;

        if(user.password != user.confirmPassword) {
            let toast = this.toast.create({
                message: 'Passwords do not match',
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
            return;
        }

        user.groupId = 'admin.carga';
        user.type = 'client';
        this.accountService.create(user).subscribe( data => {
            this.isLoading = false;
            let toast = this.toast.create({
                message: 'Sign up successful',
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
            this.navCtrl.push('LoginPage');
        }, err => {
            this.isLoading = false;
        });
    }

}
