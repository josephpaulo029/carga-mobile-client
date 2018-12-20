import { Component } from '@angular/core';
import { IonicPage, NavParams, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AccountService } from '../../providers/account.api';

@IonicPage()
@Component({
  selector: 'page-attachments',
  templateUrl: 'attachments.html'
})
export class AttachmentsPage {

    isLoading: Boolean = false;
    user: any = {};

    constructor(private navCtrl: NavController, 
        private accountService: AccountService,
        private storage: Storage) {
    }

    ionViewWillEnter() {
        this.getUser();
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

    viewAttachment(attachment) {
        this.navCtrl.push('ViewAttachmentPage', {
          attachment: attachment
        });
    }
}