import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

export class DialogData {
  command: string;
  data: any;
  constructor(command: string, data: any) {
    this.command = command; this.data = data;
  }
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  public fg!: FormGroup;
  public selectedUser: string | undefined;
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    switch (this.data.command) {
      case "login":
        this.fg = this.fb.group({
          userName: [null, Validators.required],
          password: [null, Validators.required]
        });
        break;
      case "createChat":
        this.fg = this.fb.group({
          user: [this.data.data[0], Validators.required],
          isGroupChat: [false, Validators.required]
        });
        break;

      default:
        break;
    }
  }


  public login() {
    var ddt = new DialogData("login", { userName: this.fg.controls.userName.value, password: this.fg.controls.password.value })
    this.dialogRef.close(ddt);
  }

  userComparer(d1: any, d2: any) {
    console.log(d1, d2);
    if (d1 && d2)
      return d1.userName == d2.userName;
    else
      return false;
  }

  sendDataAndClose(command: string, data?: any) {
    var ddt = new DialogData(command, { user: this.fg.controls.user.value, isGroupChat: this.fg.controls.isGroupChat.value });
    this.dialogRef.close(ddt);
  }
  // selectionChanged(e: MatSelectChange) {
  //   console.log(e.value);
  //   this.fg.controls.user.setValue(e.value);
  // }

  slideToggleChange(e: MatSlideToggleChange) {
    console.log(e);
    if (e.checked)
      this.fg.controls.user.setValue([]);
    else
      this.fg.controls.user.setValue(this.data.data[0]);
  }
}
