import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-view-attachment',
  templateUrl: 'view-attachment.html'
})
export class ViewAttachmentPage {

    attachment: any;

    constructor(private navParams: NavParams) {
        this.attachment = navParams.get('attachment');
    }

    ionViewWillEnter() {

    }
}