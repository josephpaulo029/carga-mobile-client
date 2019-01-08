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
        custom: {
            rejectionReason: 'null'
        }
    };
    isLoading: Boolean = false;
    isError: Boolean = false;
    errorMessages: any = {
        email: '',
        confirmPassword: ''
    };
    checked: Boolean = false;

    constructor(public navCtrl: NavController, 
        private toast: ToastController,
        private accountService: AccountService) {}

    login() {
        this.navCtrl.push('LoginPage');
    }

    goToTerms() {
        if(!this.isLoading)
            this.navCtrl.push('TermsConditionsPage');
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

    validateEmail(event) {
        let email = event.target.value;
        if(!email) {
            this.errorMessages.email = '';
            this.isError = false;
            return;
        }
    
        let regex= /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let isValid = regex.test(String(email).toLowerCase());
    
        if(!isValid) {
          this.errorMessages.email = 'Invalid email';
          this.isError = true;
        } else {
          this.errorMessages.email = '';
          this.isError = false;
        }
    }

    validateConfirmPassword(event) {
        let confirmPass = event.target.value;

        if(!confirmPass) {
            this.errorMessages.confirmPassword = '';
            this.isError = false;
            return;
        }
    
        if(confirmPass != this.user.password) {
          this.errorMessages.confirmPassword = 'Passwords do not match';
          this.isError = true;
        } else {
          this.errorMessages.confirmPassword = '';
          this.isError = false;
        }
    }

}
