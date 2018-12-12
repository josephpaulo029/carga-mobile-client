import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth.api';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
  providers: [AuthService]
})
export class ForgotPasswordPage {

    user: any = {};
    isLoading: Boolean = false;

    constructor(private navCtrl: NavController, 
        private navParams: NavParams,
        private authService: AuthService) {
            if(navParams.get('username')) {
                this.user.username = navParams.get('username');
            }
    }

    ionViewWillEnter() {

    }

    cancel() {
        console.log('test');
        this.navCtrl.setRoot('LoginPage');
    }

    submit(user) {
        this.isLoading = true;
        this.authService.forgotPassword(user).subscribe( data => {
            this.isLoading = false;

        });
    }

}