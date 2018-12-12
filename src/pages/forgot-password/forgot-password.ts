import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AuthService } from '../../providers/auth.api';
import { AccountService } from '../../providers/account.api';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
  providers: [AuthService, AccountService]
})
export class ForgotPasswordPage {

    user: any = {};
    isLoading: Boolean = false;
    isSaving: Boolean = false;
    currentPage: any = 1;
    token: any;
    errorMessages: any = {
        token: '',
        confirmPassword: ''
    }

    constructor(private navCtrl: NavController, 
        private navParams: NavParams,
        private toast: ToastController,
        private accountService: AccountService,
        private authService: AuthService) {
            if(navParams.get('username')) {
                this.user.username = navParams.get('username');
            }
    }

    cancel() {
        this.navCtrl.setRoot('LoginPage');
    }

    submit(user) {
        this.isLoading = true;
        this.authService.forgotPassword(user).subscribe( data => {
            this.isLoading = false;
            this.currentPage = 2;
        });
    }

    validateToken(token) {
        let user = this.authService.decodeToken(token);

        if(!user) {
            this.errorMessages.token = 'Invalid token';
            return;
        } else {
            this.currentPage = 3;
        }
    }

    validateConfirmPassword(event) {
        let confirmPass = event.target.value;

        if(!confirmPass) {
            this.errorMessages.confirmPassword = '';
            return;
        }
    
        if(confirmPass != this.user.password) {
          this.errorMessages.confirmPassword = 'Passwords do not match';
        } else {
          this.errorMessages.confirmPassword = '';
        }
    }

    changePassword(user) {
        this.isSaving = true;
        this.accountService.changePassword(user, this.token).subscribe( data => {
            this.isSaving = false;
            let toast = this.toast.create({
                message: 'Password has been updated successfully. You can now login.',
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
            this.navCtrl.push('LoginPage');
        });
    }

}